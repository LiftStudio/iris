# IRIS — CARTE DU CŒUR DU MOTEUR (lecture du 22/10/2026, master a8b22dd, v2.0)

Lecteur : aucune modification du dépôt `C:/Users/hgami/Downloads/IRIS`. Mesures faites dans le navigateur intégré sur
`http://localhost:8124/` (serveur `serve.py 8124` déjà lancé), prototypes jetables dans la console puis retirés
(bot créé puis détaché de la scène, ensembles d'entrée vidés, `placerAuDepart()`).
Toutes les lignes citées sont celles de master a8b22dd.

---------------------------------------------------------------------------------------------------------------------

## 0. EN UNE PAGE

- **Un seul jeu, une seule boucle, un seul joueur.** `js/main.js` crée `Game` (js/game.js), qui crée `this.user = new
  Player(HAYTHEM, scene)` (js/game.js:215). Tout le reste (caméra, sièges, carte vivante, tactile, manette, HUD) lit
  `game.user` — il n'existe aucune liste d'entités.
- **Le « mode » n'est pas un mode de jeu.** `game.mode` vaut `'chargement'` puis `'lobby'` (= « en jeu, balade »). Le
  test `mode === 'lobby'` sert à dire « en jeu » à **14 endroits dans 5 fichiers** (game.js ×8, touch.js ×3, manette.js ×2,
  main.js ×1). Un nouveau mode `'fps'` casserait d'un coup la souris, la manette, le tactile, la roue, la pause manette.
  → **Garder `mode = 'lobby'` pour « en jeu » et ajouter à côté un objet de règle `game.partie`** (balade / fps / prophunt).
- **Boucle à pas fixe 1/120 s** (js/game.js:35, 459-472) + interpolation d'affichage (`Player.memoriser/presenter`),
  `update(dt)` (js/game.js:507) est l'unique point d'entrée de la simulation : c'est là que se branche la règle de jeu.
- **La vue 1re personne existe mais n'est pas une vue FPS** : corps entier caché (`p.mesh.visible = false`,
  js/game.js:1031), œil posé sur l'OS de la tête animée (balancement, respiration, inclinaison), regard LISSÉ
  (damp 22 : 90 % atteint en 105 ms), tangage borné à **−5,7° / +51,6°** (on ne peut pas lever les yeux), le corps
  tourne vers sa marche et non vers la visée, aucun pointeur brut, aucun clic de souris lu par le jeu.
- **Les entrées** passent toutes par `Input` (js/input.js) : touches (e.code), manette (codes virtuels « Pad:X »),
  tactile (codes « Tactile:<action> »). **La souris (boutons, molette) n'y entre pas du tout.** Les actions sont
  déclarées dans `ACTIONS` (js/settings.js:8-23) ; en ajouter une la fait apparaître dans Options › Commandes, au
  clavier et à la manette automatiquement.
- **HUD et menus = HTML** (index.html:146-225) piloté par `HUD` / `showOverlay` (js/ui.js) ; la manette les parcourt de
  l'extérieur (js/manette_menus.js, liste `RACINES`).
- **Pièges vérifiés en jeu** : une touche non liée (Digit1…8) reste « pressée » pour toujours et déclenche une emote
  fantôme à l'ouverture de la roue ; une touche appuyée pendant la PAUSE agit à la reprise (Espace → saut mesuré).

---------------------------------------------------------------------------------------------------------------------

## 1. MESURES (navigateur intégré, 22/10/2026)

Machine : AMD Radeon intégrée (ANGLE D3D11, `0x1681`), fenêtre 1138 × 568, DPR 1,4. **D'autres onglets 3D étaient ouverts
en même temps (autres lecteurs) : les temps absolus d'image sont pessimistes ; les coûts unitaires (boucles de 200 à
2000 appels) sont fiables.**

| Mesure | Valeur |
|---|---|
| Chargement complet (1er lancement de la session, profil `ecole/pc`) | **32,7 s** : fichiers 0,47 s, terrain 10,4 s, joueurs 5,2 s, shaders 13,7 s, 1re image 2,8 s ; 21,9 Mo comptés (`__chargement.mesures`) |
| Qualité auto | départ `high`, redescendue `medium` en ~1 min |
| Cadence (onglet affiché, autres onglets 3D ouverts) | 23,7 im/s ; `Game.frame` (JS + soumission du rendu) médiane 21,2 ms, p95 26,6 ms |
| Mémoire GPU (renderer.info) | 1 577 géométries, 507 textures, 138 programmes |
| `updateCamera` vue 3 (caméra V2 complète) | **0,126 ms** |
| `updateCamera` vue 1 | 0,009 ms |
| `Game.update` (un pas 1/120, Haythem à l'arrêt) | 0,15 ms |
| `Player.update` à l'arrêt / en marche | 0,16 ms / 0,27 ms par pas |
| **Un 2e `Player` (bot) qui marche, `presenter` compris** | **0,32 ms par pas** → ≈ 0,64 ms par bot et par image à 60 im/s (2 pas) → 10 bots ≈ 6,4 ms de processeur par image |
| Création d'un `Player` | 2,4 ms synchrones (modèle en cache), avatar + 24 clips prêts en < 4 s |
| Avatar de Haythem | 4 maillages skinnés : `avaturn_body` (9 986 sommets, TÊTE ET MAINS COMPRISES), `avaturn_hair_0` (480), `avaturn_shoes_0` (3 310), `avaturn_look_0` (2 065, la tenue) + leurs « jumeaux de profondeur » (js/game.js:955-979) ; ≈ 22 k triangles |
| `carte.maj(dt, jeu)` | 0,058 ms |
| **Rayon de tir** `collisions.rayonLibre(ax,ay,az,bx,by,bz,0)` sur 30 m | **0,018 ms** (≈ 55 rayons par milliseconde) ; depuis le départ, droit devant : mur à 8,75 m (fraction 0,29) |
| Monde solide | 1 466 formes, 53 sols/rampes, 118 plafonds |
| Sièges | `game.sieges.length` = **64** au rez-de-chaussée (liste refiltrée par niveau, voir piège 9) ; 346 au total selon le README |
| Souris (sensibilité 1) | lacet 0,0025 rad/px → **2 513 px pour 360°** ; tangage 0,002 rad/px ; bornes du tangage −0,1 / +0,9 rad = **−5,7° (haut) / +51,6° (bas)** |
| Lissage du regard, vue 1 | `lookCur.lerp(_v, damp(22, dt))` : 30,7 % par image à 60 Hz, 14,2 % à 144 Hz, **90 % du geste après 105 ms** |
| Manette (stick droit à fond, sens 1) | lacet 2,9 rad/s (166°/s), tangage 1,6 rad/s (92°/s), courbe ^1,8, zone morte 0,15 |
| Tactile (glisser à droite) | 0,006 rad/px en lacet, 0,004 en tangage, mêmes bornes −0,1 / 0,9 |
| Champ | 63° vertical (horizontal plafonné à 108°) → **94,9° horizontal en 16:9**, 101,6° dans la fenêtre de test (2:1) ; +7° au sprint (70° au plus) |
| Œil en vue 1 | à 12 cm de l'os `Head` (devant, selon le CAP DU CORPS), y = moyenne (tête + 9 cm, 1,609 m nominal) ; near 0,08 m, far 400 m |
| Déplacement (fiche spd 99) | course 5,48 m/s, sprint ×1,32 = 7,23 m/s, marche plafonnée 2,15 m/s, en l'air ×0,35 ; inertie τ 0,13 s (départ) / 0,085 s (arrêt) |
| Endurance | sprint −22/s (≈ 4,5 s de sprint), +13/s, +5/s de plus en marchant ; vidée : vitesse ×0,78 |
| Saut | 2,6 m/s → apogée 0,345 m, 0,53 s en l'air ; `jumpY` est un décalage d'affichage, le sol est `collisions.solEn` |
| Rotation du corps | 13 rad/s (8,5 au-delà de 6 m/s), accélération 220 rad/s² |
| Pas fixe | 120 Hz, 6 pas au plus par image (5 au téléphone), `acc` plafonné à 0,25 s, `dt` à 0,05 s |

---------------------------------------------------------------------------------------------------------------------

## 2. ORDRE D'UNE IMAGE — `Game.frame(dt)` (js/game.js:444-492)

```
fx.debutImage()                                  chrono processeur (js/fx.js:1790)
body.en-jeu  <- mode === 'lobby'                 (css : #tourner en portrait)
input.scruter(game, dt)                          MANETTE : boutons -> codes Pad:*, stick G -> axe, stick D -> camYaw/camPitch, menus
audio.setListener(camera.position)
wheelAte = updateEmoteInput(dt)                  roue des emotes (peut « manger » la pause)
pressed('pause') -> togglePause()                (si en jeu et non mangée)
pressed('phone') -> cb.onPhone()                 js/main.js:43
pressed('camera') -> vue 3 -> 2 -> 1 -> 4 -> 3, settings.set('game.vue')
si !paused : pas fixes 1/120 → this.update(FIXED_DT)  (Player.poseVisible vrai au dernier pas)
interpoler()                                     user.presenter(acc / FIXED_DT)
updateCamera(paused ? 0 : dt)
carte.maj(dt, this)                              portes auto, lampes, visibilité, niveau courant, sièges du niveau
weather.update ; cb.onTick(dt) (téléphone) ; scene.userData.animate(time) ; ombres.update(…, this.user) ; préchauffe
fx.calme = true ; fx.render(dt)
input.endFrame()                                 (vide !)
compteur FPS
```
Deux enveloppes posées de l'extérieur : `TouchControls` remplace `game.frame` par `frame + this.tick(dt)`
(js/touch.js:116-117) et `main.js` enveloppe `game.enterLobby` pour `touch.refresh()` (js/main.js:62-63).

`update(dt)` (js/game.js:507-554) : `user.memoriser()` ; hors balade → `user.move(ZERO) ; user.update` ; sinon axe
relatif à `camYaw` (+ `_decalCmd` du cap assisté), arrêt d'emote, aide, `updateSieges`, allure marche/sprint,
`user.move(_dir, sprint, dt)`, saut (`pressed('jump')`), `user.update(dt)`, `hud.stamina`.

---------------------------------------------------------------------------------------------------------------------

## 3. MODULE PAR MODULE

### 3.1 js/main.js (99 l.) — l'assemblage
- **Rôle** : attend les fichiers (`__chargement.fichiers()`, l.17-22), crée `AudioFX` (son allumé au 1er `pointerdown`/
  `keydown`, l.27), `buildOptions` (l.33-38, `onOpen/onClose` → `game.input.blocked`), `new Game(audio, cb, settings)`
  (l.40-45, `cb = { onOptions, onAide, onPhone, onTick }`), `new Phone` (l.49-53), `settings.onChange` (l.56 :
  volumes, `game.applySettings()`, roue), tactile (l.59-65), service worker (l.67-70), `hoops-entree` (l.72-75),
  `window.__game / __settings` (l.79), le RIDEAU (l.83-99 : `preparerJeu` puis `ch.pret(commencer)` où
  `commencer = audio.init + plein écran + game.enterLobby()`).
- **Où s'accrocher** : `commencer` (l.84) est LE point où l'on choisirait d'ouvrir un MENU PRINCIPAL au lieu de
  `enterLobby()`. Les `cb` du constructeur sont le canal jeu → application.

### 3.2 js/game.js (1 114 l.) — boucle, caméra, sièges, pause
- **Exports** : `HAYTHEM` (l.131-132 : `{ id, name, height: 1.73, spd: 99, color1, color2, skin, model: 'assets/haythem.glb',
  modelHeight: 1.84 }`), `class Game`.
- **Constructeur** (l.135-291) : renderer (l.144-151), `scene`, `camera` (PerspectiveCamera champBase, near 0,08, far 400,
  l.153), `this.vue` (1|2|3|4 depuis `settings.game.vue`, l.159-160), `carte = construireCarte(scene, renderer)` (l.163),
  `collisions`, `Player.collisions`, `sieges` + `Player.poserRangs` (l.166-167), `?debug=murs` (l.168), `fx = new PostFX`,
  `ombres`, `input = new Input(bindings)` (l.177), `hud = new HUD()`, `wheel = new EmoteWheel(...)`, `weather`,
  `Couches.son = audio`, `Player.preparerRendu` (l.186-211), **`user = new Player(HAYTHEM, scene)`** (l.215),
  état (l.219-226 : `mode`, `paused`, `time`, `camYaw`, `camPitch`, `dragging`, `shake`, `camPos`, `_presSiege`),
  souris (l.229-254), orientation (l.257-261), événements de qualité/GPU (l.265-287), `applySettings()`, `placerAuDepart()`.
- **Méthodes publiques** :
  `applySettings()` (l.294) · `prechaufferScene()` (l.329) · `fpsMax()` (l.332) · `start()` (l.338) ·
  `placerAuDepart()` (l.359 : remet tout à zéro, caméra posée) · `enterLobby()` (l.378) · `aideRepos()/majAide()/lobbyHint()`
  (l.392-403) · `updateEmoteInput(dt)` (l.408) · `canEmote()/doEmote(i)` (l.425-430) · `togglePause()` (l.432-442) ·
  `frame(dt)` (l.444) · `addShake(amp, dur = 0.4)` (l.494, secousse en POSITION) · `interpoler()` (l.502) ·
  `update(dt)` (l.507) · `updateSieges(u, a)` (l.560) · `updateCamera(dt, poser = false)` (l.1005).
- **Caméra V2** (vues 2/3) : `_partPiece` (l.605), `_seuilOuvert` (l.639), `_solSous` (l.664), `_plafondCam` (l.681),
  `_essaiCam` (l.689), `_cibleCam` (l.735), `_voitTete` (l.866), `_assistCap` (l.878), `_champ` (l.929), `_fantome/_opacite`
  (l.944-979, demi-transparence par jumeaux de profondeur), `_dansLImage` (l.986). Constantes en tête (l.35-110).
  **Vues 1 et 4** : l.1010-1034 (voir § 5.2).
- **Débogage** : `__game.freeCam = true` coupe `updateCamera` (l.1006).
- **État lisible pour un futur réseau** : `camYaw`, `camPitch`, `vue`, `time`, `paused`, `mode` ; l'état du joueur est
  dans `Player` (§ 3.3).

### 3.3 js/player.js (1 159 l.) — le contrôleur de Haythem
- **Exports** : `urlAvatar(url)` (l.55 : assets/tel/ au téléphone), `prechargerModele(url)` (l.82), `class Player`.
- **Statiques** : `Player.collisions` (l.1153), `Player.rangs` (l.1155), `Player.poseVisible` (l.1157),
  `Player.preparerRendu` (l.1159), `Player.poserRangs(sieges)` (l.752).
- **`new Player(def, scene)`** (l.142) : `def` = fiche type HAYTHEM ; construit le bonhomme de secours (`_build`, l.187,
  `root.userData.dynamique = true`) puis charge l'avatar (`_loadAvatar`, l.231 : clone squelette, matériaux clonés,
  `AvatarRig`, tenues, `EclairagePerso`, clips du manifeste `_loadAnims` l.291, montré quand programmes et clips sont prêts).
- **État** (l.144-180) : `pos` (pieds, y = sol), `vel`, `facing`, `faceWant`, `ang`, `posPrec/posAff/angAff/solAff/yAff`,
  `stamina`, `staminaMul`, `speedMul`, `jumpY/jumpVel/airborne/sautId/landT`, `marche`, `sprinting/sprintVu`, `speedNow`,
  `lateral/lateralDir/backward`, `emote`, `assis`, `rang`, `tel`, `cibleRegard`, `avatar` (AvatarRig), `anim`
  (AnimPlayer), `avatarModel`, `mesh` (groupe racine, échelle h/2), `body` (secours), `couches`, `bounds`, `disposed`,
  `vuePremiere`, `state` (toujours `'idle'`).
- **API** :
  `move(dir: Vector3 monde normalisé|nul, sprint: bool, dt)` (l.673 : vitesse, endurance, inertie, `C.deplacer`, `C.solEn`,
  bornes, lateral/backward, **`faceWant` = direction de la vitesse**, `turnTo`) ·
  `update(dt)` (l.1068 : saut, emote, téléphone, assis, pose, `_driveAnim`, fondu, couches, sol) ·
  `memoriser()` (l.649) · `presenter(a)` (l.652) · `jump(v = 2.6) → vitesse appliquée` (l.871) ·
  `setFacing(x, z)` (l.856, d'un coup) · `faceTo(target, doux, net)` (l.862) · `turnTo(want, dt)` (l.831) ·
  `gasMul()` (l.853) · `sasseoir(siege)` (l.381) · `seLever()` (l.394) · `get assisPose` (l.401) ·
  `startEmote(def) → bool` (l.879) · `stopEmote()` (l.884) · `sortirTel()/rangerTel()/taperTel(d)/telActif()` (l.563-567).
- **Animation** : `_driveAnim` (l.470) choisit idle / échelles de locomotion `LOCO_AV/AR/LAT_D/LAT_G` (l.41-44) d'après
  `lateral`/`backward` (donc d'après l'écart entre la VITESSE et le CAP : des pas chassés existent déjà) / saut / emote.
  `_poserReprises` (l.535) pose la **couche du haut du corps** (`AnimPlayer.jouerHaut(name, cle, vit, t0)` /
  `stopHaut()`, js/anim.js:551-558) et les bras procéduraux. Les clips sont dans `assets/anims/manifest.json`
  (24 clips : idle, run, run_alt, sprint, def_slide_l/r, def_back, walk, walk_back, walk_side(_m), saut, block, spin_alt,
  victory, celebrate_2/3, taunt, 6 danses) — **aucun clip accroupi, arme, rechargement, lancer, mort**. LA CAGE en a
  quelques autres (Defeated.fbx, Picking Up.fbx, Goalkeeper Idle.fbx, Running Jump.fbx).
- **Os utiles** (`avatar.bone(nom)`) : Hips, Spine, Spine1, Spine2, Neck, Head, épaules, bras, avant-bras, mains, doigts,
  jambes. `AvatarRig` (js/avatar.js) : `bone`, `ikBras(cote, cible, fDes, nDes, pole, k)` (l.276), `repereMain(cote, W, f, n)`
  (l.261), `viserPoint(nom, enfant, cible, k)` (l.254), `plierDoigts(cote, c, k)` (l.344), `ikJambe`, `applyArms`, `apply`.
  **Le téléphone tenu en main** (`_placerTel`, l.584-639 : objet placé devant la poitrine puis main amenée par IK, objet
  recollé à la paume) est le modèle exact d'une ARME tenue à la 3e personne.

### 3.4 js/input.js (108 l.) — l'entrée unifiée
- **`new Input(bindings)`** (l.15) ; `blocked` (l.19) ; `touchAxis`, `touchSprint` (l.20) ; `manette = new Manette(this)`.
- **Ensembles** : `downSet`, `pressedSet`, `releasedSet` de codes (`e.code`, `Pad:*`, `Tactile:<action>`).
- **API** : `setBindings(b, pad)` (l.41 : `bind[id] = [...touches, ...pad, 'Tactile:'+id]`) · `scruter(game, dt)` (l.51) ·
  `presser(code)/relacher(code)` (l.53-54) · `isDown(c)/keyPressed(c)/keyReleased(c)` (l.57-59, **sans consommation**) ·
  `down(id)` (l.62) · `pressed(id)/released(id)` (l.66-67, **consomment le front**) · `peek(id)` (l.68) · `endFrame()` (l.77,
  vide) · `axis() → {x, y}` (l.82 : tactile > clavier > stick gauche) · `sprint()` (l.89) · `amplitude()` (l.94) · `dispose()`.
- `_kd` (l.22-28) : ignoré si `blocked` ou si la cible est un INPUT/TEXTAREA ; `preventDefault` sur `PREVENT`
  (Space, flèches, Shift, **Tab**, l.12) et sur toute touche liée.
- **Aucun écouteur de souris** (boutons, molette) : à ajouter ici (§ 7.3).

### 3.5 js/settings.js (247 l.) — actions, réglages, libellés
- **`ACTIONS`** (l.8-23) : `{ id, label, group, def: [touche1, touche2], pad: [bouton1, bouton2], stick }`.
  Existantes : forward/back/left/right (stick), sprint (Shift G/D, RT), walk (Alt G, KeyZ=W AZERTY ; L3), jump (Space ; A, X),
  interact (Enter, E ; Y), emote (T, G ; LB), camera (C ; Back, croix ↓), phone (P ; croix ↑), pause (Échap ; Start).
- **`DEFAULTS`** (l.30-57) : `graphics{…}`, `audio{master, sfx}`, `controls{ sensitivity, invertY, bindings,
  pad{bindings, deadzone, sens, invertY, vibrations}, tactile{taille, opacite, stick, vibrations, places} }`,
  `game{ vue, emotes }`. Clé localStorage **`iris.settings.v1`** (l.58).
- **`settings`** (singleton, l.154) : `data`, `graphics/audio/controls/game/bindings/padBindings` (accesseurs), `load()`
  (l.88 : deepMerge avec les défauts — une nouvelle action reçoit sa touche par défaut —, réparation des emplacements),
  `save()` (→ `_emit` → tous les `onChange`), `set(path, v)`, `get(path)`, `bind(id, slot, code)` (retire le code
  ailleurs), `unbind`, `bindPad/unbindPad`, `reset(section)`, `resetBindings`, `resetTactile`, `onChange(fn) → désabonner`.
- **Libellés** : `keyLabel(code)` (l.173, AZERTY), `actionKey(id)` (l.189 : clavier / manette / bouton tactile selon la
  dernière entrée), `PAD_BOUTONS` (l.200), `entree = { manette, type, tactile }` (l.205), `padLabel`, `padGlyph`,
  `padActionLabel` (l.227-246).
- Note : `applySettings` déstructure `graphics.fov` (js/game.js:298) qui n'existe plus dans DEFAULTS (reste de LA CAGE) :
  emplacement tout trouvé pour un réglage « champ de vision » FPS.

### 3.6 js/manette.js (406 l.) — la manette
- **Exports** : `manetteActive()`, `aideBalade()` (l.23-26), `typeManette(id)`, `NOM_TYPE`, `zoneMorte`, `courbe`,
  `capturerBouton(fn, delai)`, `annulerCapture()`, `infoManette()`, `class Manette`.
- `scruter(game, dt)` (l.159-217) : choisit la manette, applique zone morte, calcule les fronts, **contexte**
  (l.193-198) : `'menu'` (un écran de `RACINES` ouvert), `'roue'`, `'bloque'` (`input.blocked`), `'jeu'` ; en jeu :
  `axe` du stick gauche, **`camera(game, d, dt)`** (l.334-340, écrit `game.camYaw/camPitch` bornés −0,1/0,9 — seulement si
  `game.mode === 'lobby'`, l.206), `injecter` (codes Pad:* dans Input). Gâchettes avec hystérésis 0,35/0,22 (l.29).
- `perdue()` (l.270) met en pause si `mode === 'lobby'`. `vibrer(fort, faible, ms)` (l.376) — accessible par
  `game.input.manette.vibrer(...)` ; `vibrerPour` déclenché par `hoops-feedback` selon `RETOURS` (l.88-91, regex sur le
  texte du HUD). `notifier(txt)` (l.397).
- Boutons libres aujourd'hui : **B, RB, LT, R3, croix ←/→** (Home réservé).

### 3.7 js/manette_menus.js (376 l.) — menus à la manette
- `RACINES = ['phone', 'options', 'overlay']` (l.16), `RETOUR` (l.18), `DEFAUTS` (l.20), `CLIQUABLES` (l.14).
- `NavMenus` (l.164) : `ouvertes()` (l.180 : ordre du tableau, pas le z-index), `racine()`, `traiter(...)` (l.249 : croix/
  stick = focus spatial, A clique, B = `retour`, LB/RB onglets `.tabs`, X/Y/L3/R3 → événement `pad-bouton` sur la racine,
  l.272), `retour` (l.340 : sur `overlay`, « tape » l'action pause).
- **Un nouvel écran (menu principal, tableau des scores, fin de manche) n'est pilotable à la manette que si son id est
  ajouté à `RACINES`** (et son bouton de retour à `RETOUR`, son bouton principal à `DEFAUTS`).

### 3.8 js/touch.js (565 l.) — le tactile
- **Exports** : `IS_TOUCH` (l.28), `VRAI_TACTILE` (l.30), `class TouchControls`, `pleinEcran()` (l.544).
- Emplacements fixes `EMPL` (l.34-37 : `saut` xl, `b` l, `pause/cam/emote/tel` u), `GRAPPE` (l.39), `RANGEE` (l.41),
  `NOMS` (l.43), `NOM_ACTION` (l.45), places par défaut dans `disposer()` (l.140-146), placement libre enregistré dans
  `settings.controls.tactile.places`.
- **`_contexte()`** (l.224-238) : ce qui est visible MAINTENANT, `{ v: { emplacement: [action, libellé] }, stick }`.
  C'est LE point d'accroche des boutons TIR / VISER / RECHARGER / ARME / ACCROUPI / GRENADE / COUTEAU / DÉGUISEMENT.
- `_maj` (l.273) : **le calque entier est caché si `game.mode !== 'lobby'`** (l.274-275).
- Doigts : `_bas` (l.296 : bouton, sinon joystick dans la moitié gauche, sinon « regard »), `_appuyer` (l.351 :
  `input.presser('Tactile:'+action)`), `_regard` (l.415-423 : `camYaw -= dx*0.006*s`, `camPitch` borné −0,1/0,9),
  fronts tactiles oubliés après 0,35 s (`FRONT_MAX`, l.49 ; `_vieillir`).
- Un doigt sur un bouton ne tourne PAS la caméra (rôle `bouton`) : un bouton TIR « à la CoD Mobile » (on vise en glissant
  sur le bouton de tir) demande un rôle mixte.

### 3.9 js/ui.js (369 l.) — options, HUD, roue, pause
- **`buildOptions(settings, cb)`** (l.13) → `{ open(startTab), close(), isOpen, rafraichir() }` ; onglets `graphics`,
  `audio`, `controls`, `emotes` (index.html:195-200) ; l'onglet Commandes itère `ACTIONS` par `group` (l.165-175) ; le bloc
  manette a une **liste de boutons écrite en dur** (l.45-57) ; `listen(btn)` (l.234) ne capture que `keydown` (pas de
  bouton de souris).
- **`class HUD`** (l.269-312) : `el`, `show()/hide()`, `hint(text)` (+ `hintTxt`), `feedback(text, cls = 'info')` (grand
  texte animé ; émet `hoops-feedback`), `fps(show)/setFps(v)`, `stamina(v)`, `streak(text)`, `setLobby()` (rappel des
  touches écrit en dur).
- **`class EmoteWheel`** (l.315) : `setList`, `open/close`, `isOpen`, `hovered`, `setHover(i)`, `segs`.
- **`showOverlay(title, text, buttons[{label, cls, onClick}])`** (l.361) / `hideOverlay()` (l.369) : l'écran `#overlay`
  sert de pause ET de boîte de dialogue (image perdue, rétablie).

### 3.10 js/emotes.js (53 l.)
`EMOTES` (l.174-207 : `{ id, label, icon, clip | proc, procOnly, loop, cat, depart }`), `EMOTE_SLOTS = 8`, `EMOTE_CATS`,
`roueEmotes()` (l.214). Réutilisable telle quelle comme roue de **provocations** (taunts) du prop hunt (il faudra un son :
un prop déguisé a son avatar caché).

### 3.11 js/phone.js (165 l.)
`new Phone({ onOpen, onClose, onType })` ; `show()/hide()/toggle()` (l.131-148), `update(dt)` (réponses différées, appelé
par `cb.onTick`, **même en pause**), `push(who, txt, mine)`, `send(txt)`, `bot(kind, delay)`. localStorage
`iris.phone.v1`. Ouvert : `input.blocked = true`, pointeur libéré, Haythem sort son téléphone (js/main.js:49-53).
`onPhone` (js/main.js:43) ne vérifie que `!game.paused`.

### 3.12 js/audio.js (117 l.)
`AudioFX` : `init()` (au premier geste), `setVolumes({master, sfx})`, `setListener(pos)` (position seule, pas
d'orientation), `salle(k)` (réverbération), `_osc(type, f0, f1, dur, vol, when)`, `_noise(dur, vol, filtre, freq, attaque,
when, q)`, `_attCorps(pos)` (atténuation 3→20 m), `pas`, `crissement`, `reception`. **Tout est synthétisé, rien n'est
spatialisé à gauche/droite** : un FPS a besoin d'un `PannerNode` (ou `StereoPannerNode`) et de l'orientation de
l'auditeur. Les pas des autres `Player` sont joués par leurs couches (`Couches.son`, statique partagé) s'ils sont visibles
(js/couches.js:124, 328 : `p.mesh.visible || p.vuePremiere`).

### 3.13 js/demarrage.js (219 l.) et js/chargement.js (615 l.)
- `preparerJeu(game, ch, { avatar })` (js/demarrage.js:176-219) : 1. joueurs et clips (suivi du
  `THREE.DefaultLoadingManager`, plafonds 30 s / 12 s), 2. `game.prechaufferScene()` + attente `program.isReady()`
  (30 s), 3. `game.start()` et première image.
- `window.__chargement` (js/chargement.js:584-608) : `profil`, `telephone`, `trace`, `fichiers()`, `etape(nom, f)`,
  `avance(f)`, `souffle()`, `pret(demarrer) → promesse`, `actif()`, `enErreur()`, `figerTrace()`, `mesures`. Étapes
  `fichiers, terrain, joueurs, shaders, image` (l.82), libellés (l.102-105), astuces (l.465-476 : toutes parlent de la
  balade), « APPUIE POUR COMMENCER » (l.543). Durées mémorisées dans `iris.chargement.v1`.
- **Un avatar d'ennemi (ami de Haythem) chargé avant le rideau** doit être demandé pendant l'étape `joueurs` (comme
  `prechargerModele(HAYTHEM.model)`, js/main.js:86) pour être compté et compilé sous l'écran de chargement.

### 3.14 index.html (280 l.) et css/style.css (748 l.)
- `#boot` (l.118-145, styles en ligne l.27-111, sous-titre **« L'ÉCOLE · BALADE LIBRE »** l.128), `#game` (l.146),
  `#tourner` (l.149-154), `#touch` (l.155), `#phone` (l.158-189), `#options` (l.192-204), **`#hud`** (l.207-216 :
  `#hud-streak`, `#hud-feedback`, `#hud-hint`, `.stamina > #stamina-fill`, `#hud-keys`, `#hud-fps`, `#phone-badge`,
  `#emote-wheel`), `#overlay` (l.219-225), importmap (l.272-277), `js/main.js` (l.278).
- Couches CSS (z-index) : `#hud` 10 (`pointer-events: none`, css:139) · `.touch-ui` 15 (css:208) · `.screen` 20 (css:28) ·
  `#overlay` 30 (css:165) · `.options` 40 (css:86) · `#phone` 45 (css:349) · tactile en édition 50 (css:240) ·
  `.pad-toast` 80 (css:513) · `#tourner` 998 (css:523) · `#boot` 999.
- Classes de `body` : `touch`, `en-jeu`, `portrait`, `portrait-ok`, `pad-actif`, `pad-nav`. `body.touch` déplace le HUD
  (variables `--tc-droite`, `--tc-haut`, `--tc-endu*` posées par touch.js:181-197) et cache `.keys`/`.fps` (css:267).
- **Restes de LA CAGE réutilisables** dans style.css : `.menu`, `.select`, `.pick`, `.slot`, `.stats`, `.names`, `.clock`
  (horloge de match, css:140), `.possession` (css:144), `.coins` (css:334), `.gain`, `.arc`, `.screen-head/.screen-foot`,
  `.btn-primary/.btn-secondary`, `.tabs`.

### 3.15 sw.js (44 l.) et tools/liste_chargement.py (178 l.)
- `VERSION = 'iris-v2.0'` (sw.js:8) : **à changer à chaque modification d'index.html, style.css, du manifeste ou d'un
  fichier lourd** (c'est aussi le numéro affiché au pied de l'écran de chargement). `CORE` (l.9-10) pré-caché.
  Lourds = `/\.(glb|gltf|fbx|png|jpg|jpeg|webp|woff2?|ttf|hdr|bin)$/` ou `/vendor/` (l.23) : cache d'abord + revalidation ;
  le reste du même domaine (js, json, css, **et tout fichier audio**) : réseau d'abord, cache en secours.
- `liste_chargement.py` refait `assets/chargement.json` : modules = graphe des `import` STATIQUES depuis js/main.js
  (`graphe_modules`, l.74 — un module ajouté y entre seul) + profils relevés (`ecole/pc`, `ecole/tel`) dans
  `tools/chargement_releves.json`. Un nouvel asset chargé au démarrage (arme .glb, avatar d'ennemi, son) n'est compté
  dans la barre qu'après un nouveau relevé `?chargement=trace` → `copy(JSON.stringify(__chargement.traceFigee))` →
  `python tools/liste_chargement.py releve.json`.

---------------------------------------------------------------------------------------------------------------------

## 4. ÉVÉNEMENTS ET GLOBALES

| Nom | Émis par | Écouté par |
|---|---|---|
| `hoops-feedback` {text, cls} | `HUD.feedback` (ui.js:288) | manette (vibrations, manette.js:142) |
| `hoops-entree` | manette.js:366, 372 (bascule clavier ↔ manette) | main.js:72 (aides) |
| `hoops-manette` {connectee, type} | manette.js:266, 275 | main.js:77 (options) |
| `hoops-keylayout` | settings.js:171 | ui.js:260 |
| `hoops-qualite-bridee / -baissee / -remontee / -lourde` | js/fx.js | game.js:265-272 (bandeaux) |
| `hoops-gpu-perdu / -retabli` | js/fx.js | game.js:275-287 (overlay) |
| `pad-bouton` {nom}, `pad-annuler` (annulable) | manette_menus.js:272, 324 | l'écran racine (ui.js:259) |
| `resize`, `orientationchange`, `blur`, `visibilitychange`, `gamepadconnected/disconnected` | navigateur | game, touch, input, manette |

Globales console : `__game`, `__settings`, `__phone`, `__touch` (tactile seulement), `__chargement`, `__visibilite`.
**Aucun `pointerlockchange`** n'est écouté nulle part.

---------------------------------------------------------------------------------------------------------------------

## 5. RÉPONSES AUX QUESTIONS

### 5.1 Ajouter un MODE DE JEU (balade / FPS / prop hunt) sans casser la balade
1. **Ne pas toucher à `game.mode`** : `'lobby'` = « en jeu » pour 14 lectures (game.js:238, 242, 304, 379, 410, 446, 509,
   881 ; main.js:74 ; manette.js:206, 276 ; touch.js:274, 311, 418). Ajouter `game.partie` (la RÈGLE en cours) :
   `null` = balade, sinon un objet `{ id: 'fps'|'prophunt', entrer(game), sortir(game), pas(dt, cmds), image(dt),
   camera(dt, poser) → bool (vrai = elle a posé la caméra), boutonsPause() → [...], toucheCamera: false, etat(),
   appliquer(etat) }`. Si l'on tient à un nouveau nom de mode, remplacer d'abord les 14 tests par `game.enJeu()`.
2. **Crochets dans `Game`** (sans rien retirer à la balade) :
   - `update(dt)` (l.507) : en tête, après `memoriser`, `if (this.partie) { this.partie.pas(dt, this.lireCommandes(dt)); return; }`
     — la règle appelle elle-même `user.move/jump/update` et ceux de ses bots ;
   - `interpoler()` (l.502) : `presenter(a)` de TOUS les acteurs (bots, props) ;
   - `updateCamera` (l.1005) : `if (this.partie?.camera(dt, poser)) return;` (sinon caméra V2) ;
   - `frame` (l.444) : la touche `camera` (l.453-458) et `phone` (l.452) ne doivent pas agir en FPS ; `fx.calme = true`
     (l.487) → `!this.partie?.combat` (une remontée de qualité fige une image : pas en plein échange de tirs) ;
     `this.partie?.image(dt)` après `interpoler()` (HUD, arme à l'écran, effets) ;
   - `togglePause()` (l.432) : boutons fournis par la règle (« Quitter la partie », « Recommencer la manche ») ;
   - `placerAuDepart()` (l.359) reste celui de la balade ; la règle a ses propres points d'apparition.
3. **Entrer / sortir** : `game.lancerPartie(Regle)` = `this.partie?.sortir(this); this.partie = new Regle(this);
   this.partie.entrer(this); window.__touch?.refresh(); this.hud.setLobby()` ; `quitterPartie()` = `sortir`, `partie = null`,
   `placerAuDepart()`, `enterLobby()`. Le tactile s'accroche aujourd'hui en enveloppant `enterLobby` (main.js:62-63) :
   lui donner un événement (`document.dispatchEvent(new Event('iris-partie'))`) plutôt qu'une 3e enveloppe.
4. **Ce que la balade garde intact** : vues 2/3/4, sièges, emotes, téléphone, caméra V2, cap assisté — tant que
   `partie === null`, aucun chemin ne change.

### 5.2 Une vraie vue FPS
**Ce qui existe (vue 1, js/game.js:1010-1034)** : œil = os `Head` + 9 cm devant selon `p.ang` (le CAP DU CORPS),
moitié de son balancement vertical ; regard = point 3 m devant selon `camYaw/camPitch`, **lissé** (`lookCur.lerp(_v,
damp(22, dt))`) ; `camera.lookAt(lookCur)` ; secousse de position ; `p.mesh.visible = false` (**tout le corps caché :
pas de bras, pas de jambes, pas d'ombre propre**), `p.vuePremiere = true` (les pas restent audibles). Champ de `_champ`
(+7° au sprint).

**Limites pour un FPS** (toutes mesurées) :
- tangage −5,7° / +51,6° (game.js:247, manette.js:338, touch.js:422) → pour un FPS : ±85° (±1,48 rad) ;
- regard lissé : 105 ms pour 90 % du geste = retard d'entrée ressenti ; il faut poser la caméra directement :
  `camera.rotation.set(-pitch, yaw + Math.PI, 0, 'YXZ')` (convention : `camPitch > 0` = regard vers le BAS ; la caméra
  regarde vers `-(sin yaw, ·, cos yaw)`) ;
- œil sur l'os de tête : respiration, regard errant, « mains sur les genoux » quand l'endurance est vide (js/couches.js),
  inclinaison du corps dans les virages (`mesh.rotation` = tangage/roulis des couches, player.js:665) → la caméra flotte ;
  pour un FPS : œil = `posAff.x, solAff + hauteurOeil(debout 1,62 / accroupi 1,05) + jumpY, posAff.z` + balancement
  procédural maîtrisé (comme la vue 4, game.js:1015) ;
- **le corps tourne vers sa VITESSE** (`faceWant` = direction de `vel`, player.js:721) et non vers la visée : en FPS,
  appeler `p.setFacing(-sin(yaw), -cos(yaw))` à chaque pas — `_sensLoco` choisira alors tout seul pas chassés et marche
  arrière (les clips existent) ;
- pas de capture brute : `canvas.requestPointerLock()` sans option (game.js:238) → passer
  `requestPointerLock({ unadjustedMovement: true })` (promesse ; repli sans option si `NotSupportedError`) ; filtrer les
  pics de `movementX` (Chrome Windows envoie parfois des sauts de plusieurs centaines de px) ;
- `_onMove` (game.js:241) accepte aussi le glisser souris non capturé (`dragging` posé par `mousedown` de n'importe
  quel bouton) : en FPS, **pas de visée au glisser** (le clic gauche doit tirer) ; et le clic qui capture le pointeur ne
  doit pas tirer ;
- **Échap avec le pointeur capturé** : Chrome libère le pointeur et ne transmet PAS la touche à la page → la pause ne
  s'ouvre pas au premier Échap. Écouter `pointerlockchange` : perte du pointeur en pleine partie → `togglePause()`. Chrome
  refuse une recapture dans la seconde qui suit une sortie par Échap (la promesse rejette ; déjà avalée l.238) ;
- sensibilité : un seul réglage (`controls.sensitivity`, 0,1-3) ; ajouter sensibilité en visée (multiplicateur ADS) et
  champ de vision (`graphics.fov`, déjà lu et ignoré par applySettings l.298) ;
- **tête cachée ?** La tête fait partie de `avaturn_body` (un seul maillage skinné avec le corps et les mains) : on ne peut
  pas cacher la tête seule par maillage. Deux voies :
  (a) **corps entier caché + bras/arme de vue séparés** (le standard Call of Duty) : un modèle de bras + arme rendu dans
      sa propre passe (voir ci-dessous) ; ombre propre perdue (déjà le cas en vue 1) ;
  (b) **os `Head` réduit** (`avatar.bone('Head').scale.setScalar(1e-3)` en vue FPS, remis à 1 en sortie : le mélangeur
      n'écrit que des quaternions, l'échelle tient) → corps, jambes et bras visibles en baissant les yeux, cheveux repliés
      avec la tête ; mais l'ombre propre devient une ombre sans tête et les bras du corps ne tiennent pas l'arme devant la
      caméra. Recommandation : (a) pour le joueur local, avatar complet avec arme en main (IK façon `_placerTel`) pour les
      bots et, plus tard, les autres joueurs.
- **Où rendre l'arme de vue** : la chaîne de js/fx.js est `renderPass (PasseSceneMSAA) → gtao → oeil → bloom → output →
  [sortieBasse] → smaa → grade` (js/fx.js:616-644). Insérer une passe « arme » (scène + caméra à elle, near 0,01,
  `clear = false`, profondeur effacée) **juste après `gtao`** (`composer.insertPass(passe, 2)`) : l'arme reçoit
  l'exposition, le bloom, le rendu des couleurs et l'étalonnage comme le décor, mais pas l'occlusion des murs. En
  BASSE sans composer (`fx.enabled === false`, js/fx.js:2062), dessiner l'arme après `renderer.render` avec
  `autoClear = false` + `clearDepth()`. Tout objet qui bouge dans la scène principale doit porter
  `userData.dynamique = true` à sa racine (js/ombre_cache.js:145-151), sinon l'ombre en cache le fige.
- `fx.flash` (js/fx.js:647, décroît de 3,5/s l.2017, `uFlash`) = un éclair blanc plein écran prêt à servir (grenade,
  coup reçu) ; `game.addShake(amp, dur)` (game.js:494) secoue la POSITION — le recul doit être un décalage d'angles.

### 5.3 Brancher les nouvelles actions
1. **Déclarer** dans `ACTIONS` (js/settings.js:8-23), nouveaux groupes « Combat » et « Prop hunt » (l'onglet Commandes
   les affiche seul, ui.js:166-174). Proposition (codes physiques e.code ; libellé AZERTY entre parenthèses) :

| id | label | def clavier | pad (FPS, façon CoD) | tactile |
|---|---|---|---|---|
| `tir` | Tirer | `Souris:0`, null | RT | TIR (gros, à droite) |
| `visee` | Viser | `Souris:2`, null | LT | VISER |
| `recharger` | Recharger | `KeyR` (R), null | X | RECHARGER (près de TIR) |
| `arme` | Changer d'arme | `Molette`, `KeyQ` (A) | Y | ARME |
| `accroupi` | S'accroupir / glisser | `ControlLeft`, `KeyC` (C) | B | ACCROUPI |
| `couteau` | Couteau | `KeyV` (V), `KeyF` (F) | R3 | COUTEAU |
| `grenade` | Grenade | `KeyG` (G), null | RB | GRENADE |
| `deguiser` | Se déguiser (prop hunt) | `KeyE` (E), `Souris:0` | X ou Y | DÉGUISER |
| `scores` | Tableau des scores (tenir) | `Tab`, null | Back | SCORES (rangée du haut) |
| `arme1/2/3` | Arme 1, 2, 3 | `Digit1`… | — | — |

   **Conflits avec les touches actuelles** : `KeyC` = camera, `KeyG` = emote (secondaire), `KeyE` = interact,
   `Pad:RT` = sprint, `Pad:X` = jump (secondaire), `Pad:Y` = interact, `Pad:LB` = emote, `Pad:Back` = camera,
   `Pad:L3` = walk. Comme un code partagé est **consommé par la première action qui le lit** (`_take`, input.js:69-75),
   il faut **un jeu de touches par profil** : `controls.bindings` (balade, inchangé) et `controls.bindingsFps`,
   `controls.pad.bindingsFps` (combat), et `Input.setBindings(...)` appelé à l'entrée/sortie de partie. `settings.load()`
   (l.88-119) doit réparer ces deux tables comme il répare les autres, et l'onglet Commandes doit montrer le profil
   choisi (sous-onglets BALADE / COMBAT).
2. **Souris dans Input** (input.js) : `mousedown`/`mouseup` → `presser('Souris:'+e.button)` / `relacher(...)` (seulement
   si le pointeur est capturé ou en partie, et pas sur un écran HTML), `wheel` → front `Molette:haut`/`Molette:bas`
   relâché à l'image suivante, `contextmenu` → `preventDefault()` sur le canvas (aujourd'hui seulement au tactile,
   touch.js:93). `keyLabel` (settings.js:173) : libellés « CLIC G », « CLIC D », « MOLETTE ». `listen()` (ui.js:234) :
   capturer aussi `mousedown` pour réaffecter.
3. **Lecture** : armes automatiques par `down('tir')`, semi-auto par `pressed('tir')`, visée par `down('visee')`
   (maintenir) ou bascule (réglage), accroupi : appui bref = bascule, en sprint = glissade.
4. **Manette** : rien à coder de plus pour les boutons (codes Pad:* dans `ACTIONS[].pad`). À faire : bornes du tangage
   (manette.js:338), `camera()` seulement si `mode === 'lobby'` (l.206) — OK avec la règle-objet ; assistance de visée
   (ralentissement près d'une cible) à faire dans la règle ; la liste en dur du bloc manette (ui.js:45-57) et
   `aideBalade()` (manette.js:24) à faire suivre ; `RETOURS` (manette.js:88) ou `game.input.manette.vibrer(f, l, ms)` pour
   le tir et les coups reçus.
5. **Tactile** : ajouter les emplacements dans `EMPL` (touch.js:34-37), `NOMS`, `NOM_ACTION`, places par défaut dans
   `disposer()` (l.140-146), contexte dans `_contexte()` (l.224-238 : en FPS `tir`, `visee`, `recharger`, `accroupi`,
   `saut`, `grenade`, `arme`, `scores` ; en prop hunt côté prop `deguiser`, provocation) ; pour viser en tirant, donner
   au doigt du bouton TIR le rôle mixte « bouton + regard » dans `_bas/_bouge` (l.296-337). Bornes du tangage l.422.

### 5.4 HUD et menus
- **Le HUD** : du HTML sous `#hud` (index.html:207-216), `pointer-events: none`, styles css:139-216 ; une seule classe
  `HUD` (ui.js:269). Ajouter dans index.html : `#hud-viseur` (réticule centré, écarté par la dispersion), `#hud-touche`
  (marqueur de touche), `#hud-vie`, `#hud-munitions` (chargeur / réserve / nom d'arme), `#hud-manche` (score des
  équipes, chrono : reprendre `.clock`/`.possession` de css:140-144), `#hud-fil` (fil des éliminations, en haut à
  droite), `#hud-degats` (indicateurs de direction), et les méthodes `HUD.vie(v)`, `HUD.munitions(c, r, nom)`,
  `HUD.manche(scoreA, scoreB, t)`, `HUD.elimination(tueur, arme, victime, tete)` (pile de 5 lignes qui s'effacent en 5 s,
  DOM touché seulement quand la valeur change — c'est la règle de `stamina()`, ui.js:293-296), `HUD.touche()`. En partie,
  cacher `.stamina`, `#hud-keys`, `#phone-badge` par une classe de `body` (`body.combat`) ; au tactile, réutiliser les
  variables `--tc-*`.
- **Tableau des scores** (Tab / Back maintenu) : un bloc `#tableau` en `.screen` (z 20) non interactif, montré tant que
  `down('scores')` — pas dans `RACINES` (sinon la manette passerait en contexte « menu » et lâcherait les commandes).
- **Menu principal** : un écran `#menu` (`.screen menu`, z 20 ; LA CAGE en a un : `buildMenu`, son ui.js:90 et son
  index.html:167) avec BALADE / FPS CONTRE LES BOTS / PROP HUNT / OPTIONS ; l'ajouter à `RACINES` et `DEFAUTS`
  (manette_menus.js:16-20). Ouvert depuis `commencer` (main.js:84) au lieu de `enterLobby()`, et depuis la pause
  (« Changer de mode »). Pendant le menu : `mode` non `'lobby'` (le tactile se cache, l'entrée ne pilote rien), HUD caché
  → `fx._enJeu()` faux (js/fx.js:1911-1916 : la qualité auto attend le HUD pour mesurer), caméra fixe ou en orbite lente.
- **Fin de manche / de partie** : `showOverlay(titre, texte, boutons)` (ui.js:361) suffit (il est déjà dans `RACINES`),
  mais `retour` (B) y « tape » la pause (manette_menus.js:344) : un écran de fin dédié vaut mieux qu'un overlay détourné.

### 5.5 La pause et le téléphone
- **Pause** (`togglePause`, game.js:432-442) : `paused = true`, pointeur libéré, overlay PAUSE (Reprendre, Options,
  Commandes, Revenir au départ). Pendant la pause la boucle tourne encore : pas de simulation (`update` non appelé),
  caméra avec `dt = 0`, `carte.maj(0)`, rendu, **`cb.onTick(dt)` → le téléphone reçoit ses messages**, manette scrutée.
  `input.blocked` reste FAUX : les touches sont enregistrées (piège 2). Déclencheurs : Échap/Start (frame l.451),
  manette débranchée (manette.js:276), image GPU rétablie (game.js:284). En solo contre des bots, la pause gèle tout ce qui
  est dans `update` (bots, chrono de manche) — il faut donc que l'IA et le chrono vivent DANS `update`, pas dans `frame`.
  En réseau, la pause ne pourra plus geler le monde (elle devient un simple menu).
- **Téléphone** (P / croix ↑ / 📱) : `phone.toggle()` ; ouvert : `input.blocked = true`, pointeur libéré, `sortirTel()`
  (Haythem le tient, IK). En FPS/prop hunt : le désactiver (`onPhone` → `if (game.partie) return`) ou le réserver au
  temps mort entre deux manches ; le bouton 📱 du tactile se retire dans `_contexte()`.

### 5.6 Le chargement
Écran (js/chargement.js, script classique, avant les modules) → `main.js` attend `__chargement.fichiers()` → construction
de l'école (`new Game`, étape « terrain », 10,4 s mesurées) → `preparerJeu` (avatars et clips, puis shaders, puis
1re image) → « APPUIE POUR COMMENCER » → `enterLobby`. La liste des fichiers vient de `assets/chargement.json`
(liste_chargement.py) ; le cache vient du service worker (`iris-v2.0`). Pour le FPS : armes, bras de vue, avatars
d'ennemis (`assets/*.glb` de LA CAGE) et sons à précharger dans l'étape « joueurs » ; nouveau relevé `?chargement=trace`
puis `liste_chargement.py` ; changer `VERSION` ; ajouter les extensions audio (`ogg|mp3|wav|m4a`) à la regex des fichiers
lourds de sw.js:23 si des sons en fichiers arrivent ; mettre à jour `.boot-sous` (index.html:128) et les ASTUCES
(chargement.js:465-476).

---------------------------------------------------------------------------------------------------------------------

## 6. PIÈGES (numérotés, la plupart vérifiés en jeu)

1. **Fronts fantômes des touches non liées** — `keyPressed(c)` ne consomme pas et `endFrame()` est vide (input.js:58, 77) :
   `Digit3` appuyé une fois reste dans `pressedSet` pour toujours ; **vérifié** : ouvrir ensuite la roue a lancé l'emote
   n° 3 (« break ») sans aucune touche. Des armes sur 1/2/3 lues par `keyPressed` seraient choisies au hasard du passé.
   → vider dans `endFrame()` les codes non liés, ou ne lire que des actions (`pressed`).
2. **Touches pendant la pause** — la pause ne bloque pas l'entrée ; **vérifié** : Espace appuyé pendant la pause → saut à
   la reprise. En FPS : tir, grenade, rechargement fantômes. → vider `pressedSet`/`releasedSet` en reprenant (et en
   fermant le menu, les options, le téléphone).
3. **Code partagé = consommé par le premier lecteur** (`_take`) : deux actions sur la même touche ne marchent pas
   toutes les deux ; d'où les profils de touches (§ 5.3).
4. **`mode === 'lobby'` partout** (14 lectures) — voir § 5.1.
5. **Échap + pointeur capturé** : premier Échap avalé par le navigateur ; aucun `pointerlockchange` écouté.
6. **Le tangage borné à −5,7°** en haut, à trois endroits (souris game.js:247, manette.js:338, tactile touch.js:422).
7. **Le corps suit sa vitesse, pas la visée** ; et `turnTo` limite à 13 rad/s : en FPS, `setFacing` à chaque pas.
8. **La vue 1 lit l'os de tête animé** ; les couches (respiration, regard errant, mains sur les genoux à endurance vide)
   bougent la caméra. Aussi : `_assistCap` (cap assisté) n'agit qu'en vues 2/3, mais `_decalCmd` peut rester non nul en
   passant de la vue 3 à une vue FPS en marchant (game.js:519-531) : remettre `_decalCmd = 0` à l'entrée en FPS.
9. **Les sièges** : `game.sieges` est le MÊME tableau que `ch.sieges`, **refiltré sur place au niveau de Haythem** par
   js/ecole_etage1.js:1046-1052 (64 au RDC au départ). La liste complète n'existe qu'avant le premier `carte.maj` (ou
   dans une fermeture non exportée) : copier `game.sieges.slice()` dans le constructeur pour des bots ou des props.
10. **La carte vivante ne connaît qu'un acteur** : `carte.maj(dt, jeu)` lit `jeu.user.pos` et `jeu.camera.position`
    (carte_ecole.js:2420-2452) — portes automatiques (`portes.maj(dt, x, z, camX, camZ, y, camY)`, ecole_portes.js:580),
    lampes, niveau visible, sièges. **Un bot ne s'ouvre aucune porte** et les portes fermées sont des murs du monde solide.
11. **Le rendu coupe par la caméra** (js/ecole_visibilite.js) et par le niveau de Haythem (étages masqués) : un bot sur un
    autre niveau n'est vu qu'au travers de ce que la caméra peut voir — bien pour un FPS, mais une caméra de spectateur
    (prop hunt, joueur éliminé) qui sort du corps de Haythem doit rester cohérente avec `jeu.user` (ou il faut passer la
    position de la caméra spectatrice à `carte.maj`).
12. **Objets mobiles et ombres** : racine `userData.dynamique = true`, sinon l'ombre en cache (js/ombre_cache.js) les
    garde à leur ancienne place ; les ombres de contact ramassent les nouveaux avatars deux fois par seconde.
13. **`p.mesh` penche** (tangage/roulis des couches, player.js:665, 1132) : un prop (meuble) accroché à `p.mesh` se
    pencherait dans les virages ; le poser dans un groupe à part synchronisé dans `presenter`. `p.h` (1,73) sert à la
    caméra (`tete = sol + p.h*0.93`) : pour un prop de 0,8 m, l'abaisser ; `RAYON_JOUEUR` (0,3, config.js:13) est une
    constante pour tous.
14. **Les pas s'entendent tant que `mesh.visible || vuePremiere`** (couches.js:124, 328) : un prop dont on cache
    seulement `avatarModel` ferait encore des bruits de pas.
15. **Coût des acteurs** : 0,32 ms par pas et par `Player` animé → au-delà de 6-8 bots, animer les bots une fois par
    IMAGE (pas à chaque pas de 1/120) et simuler l'IA à 30-60 Hz ; `Player.poseVisible` existe déjà pour réserver l'IK au
    dernier pas (game.js:467).
16. **`Player` n'a pas de `dispose()`** : retirer un bot = `disposed = true`, `scene.remove(mesh)`, `telMesh`, et libérer
    les matériaux clonés (player.js:237-246) ; sinon fuite à chaque manche.
17. **Le tactile se cache si `mode !== 'lobby'`** (touch.js:274) et enveloppe `game.frame` (l.116) : toute méthode
    `frame` remplacée plus tard (débogage, mesure) doit se brancher sur l'enveloppe, pas sur le prototype.
18. **sw.js en développement** : les fichiers lourds sont servis du cache d'abord ; un .glb modifié n'arrive qu'au
    lancement suivant ou avec une nouvelle `VERSION` (serve.py envoie `no-cache`, le service worker passe devant).
19. **Détection téléphone en double** : js/chargement.js:61-69 n'a pas le test `any-pointer: fine` de js/appareil.js:47-57
    (« régression n° 7 ») → un PC tactile télécharge le profil `ecole/tel` mais joue en profil PC.
20. **README** : « Sprint : Maj ou G » (README.md:104) alors que G est la touche secondaire de la roue des emotes
    (settings.js:19) — ne pas s'en servir pour choisir les touches du combat.
21. **Pas de stéréo** : `AudioFX` atténue avec la distance mais ne place pas à gauche/droite ; un FPS sans direction des
    tirs et des pas ennemis est injouable à l'oreille.
22. **`fx.calme = true` à chaque image** (game.js:487) : la qualité auto peut remonter en plein combat (une image figée).

---------------------------------------------------------------------------------------------------------------------

## 7. COMMENT S'Y BRANCHER POUR LE FPS ET LE PROP HUNT

### 7.1 Architecture proposée (fichiers nouveaux, rien de retiré)
```
js/partie.js        la machine à états des parties : Partie (base), lancerPartie / quitterPartie, manches, score,
                    chrono, apparitions, état sérialisable (etat() / appliquer()), commandes
js/partie_fps.js    FPS contre bots : équipes ou chacun pour soi, manches, élimination, réapparition
js/partie_prop.js   prop hunt : phase de cachette (props) puis traque (chasseurs), déguisements, provocations
js/acteur.js        un ACTEUR = { id, equipe, joueur: Player, vie, arme, munitions, deguisement, commande } ;
                    Haythem est l'acteur 0, les bots les suivants (même code, même Player)
js/armes.js         fiches d'armes (cadence, dégâts, chargeur, recul, dispersion, portée), tir par rayon
                    (collisions.rayonLibre + boîtes des acteurs), recharge, visée
js/vue_fps.js       caméra FPS (yaw/pitch directs, œil fixe, accroupi, balancement, recul, champ de visée), bras et
                    arme de vue (passe insérée dans js/fx.js après gtao), pointeur brut, pointerlockchange
js/bots.js          IA : graphe de déplacement de l'école (escaliers, portes), perception (rayons), tir, chercheur/cacheur
js/hud_combat.js    réticule, vie, munitions, fil des éliminations, tableau des scores, fin de manche
```
`game.partie` (§ 5.1) est l'instance courante ; `null` = la balade d'aujourd'hui, inchangée.

### 7.2 La boucle, pas par pas (ce qui change dans js/game.js)
1. `update(dt)` l.507 : `this.user.memoriser()` → **pour tous les acteurs** (`for (const a of partie.acteurs) a.joueur.memoriser()`),
   puis `if (this.partie) { this.partie.pas(dt); return; }`.
2. `Partie.pas(dt)` : (a) **commande** de chaque acteur — Haythem : `lireCommande(input, game)` ; bots : `ia.commande(dt)` ;
   plus tard, invités réseau : commande reçue ; (b) application identique pour tous :
   `joueur.setFacing(-Math.sin(c.yaw), -Math.cos(c.yaw))` ; `dir` = axe tourné de `c.yaw` (comme l.530-535) ;
   `joueur.marche = c.marche` ; `joueur.speedMul = accroupi ? 0.45 : visee ? 0.7 : 1` ;
   `joueur.move(dir, c.sprint && !visee, dt)` ; `if (c.saut) joueur.jump(2.6)` ; armes (`armes.pas(acteur, c, dt)`) ;
   `joueur.update(dt)` ; (c) règles (dégâts, éliminations, chrono, fin de manche) ; (d) `tick++`.
3. `interpoler()` l.502 : `presenter(a)` de tous les acteurs.
4. `updateCamera(dt)` l.1005 : `if (this.partie && this.partie.camera(dt, poser)) return;` — `vue_fps.js` pose la
   caméra (vivant) ; caméra V2 de la vue 3 pour un prop (elle marche avec n'importe quel `Player` : elle ne lit que
   `p.posAff, p.solAff, p.h, p.vel, p.avatar.bone('Head')`) ; caméra libre de spectateur une fois éliminé.
5. `frame(dt)` l.444 : ignorer `camera`/`phone` en partie, `this.partie?.image(dt)` après `interpoler()`, `fx.calme`
   suivant la règle.

### 7.3 La commande (le pivot du futur multijoueur)
```js
// une commande par acteur et par pas : tout ce que la simulation a le droit de lire de l'extérieur
{ seq, axe: { x, y }, amp, sprint, marche, saut, accroupi, tir, visee, recharger, arme, couteau, grenade,
  deguiser, yaw, pitch }
```
- `lireCommande(input, game)` est le SEUL endroit qui lit `Input` en partie (fronts consommés une fois : `pressed`
  pour saut/recharger/arme/couteau/grenade/deguiser, `down` pour tir/visee/sprint/accroupi tenu), yaw/pitch copiés de
  `game.camYaw/camPitch` (la souris continue d'écrire en direct dans les écouteurs, sans lissage).
- Ni `Player` ni les armes ne lisent `Input` → un bot et un invité réseau passent par le même chemin (c'est exactement le
  principe de LA CAGE : `js/enligne.js`, hôte autoritaire, invités qui n'envoient que leurs commandes, image du match
  20 fois par seconde).
- **État sérialisable** (`Partie.etat()`) : `{ tick, phase, chrono, scores, acteurs: [{ id, equipe, x, y, z, vx, vz, cap,
  jumpY, jumpVel, airborne, vie, arme, chargeur, reserve, accroupi, deguisement: { type, rot } | null, vivant }],
  evenements: [{ t, type: 'elim'|'touche'|'tir', ... }] }` — tout en nombres et chaînes. Tirage aléatoire par une graine
  (`mulberry32(graine)`) tenue dans l'état, jamais `Math.random()` dans la simulation (le téléphone et le décor peuvent
  garder le leur).

### 7.4 La vue FPS (js/vue_fps.js)
- **Entrée** : `game.vue` n'est pas touché (le réglage de balade reste) ; la règle pose sa propre caméra.
- **Souris** : à l'entrée en partie, `canvas.requestPointerLock({ unadjustedMovement: true })` (repli sans option) ;
  `document.addEventListener('pointerlockchange', …)` : perte en partie (et pas en pause) → `togglePause()` ; tangage
  borné à ±1,48 rad ; lacet `0,0025 × sens × (visee ? multADS : 1)` rad/px ; pics de `movementX` > 400 px ignorés.
  Bornes manette (manette.js:338) et tactile (touch.js:422) : lire une borne commune `game.bornesTangage()`.
- **Caméra** : position = `posAff` + œil (1,62 debout, 1,05 accroupi, glissée de 0,15 s) + balancement de marche
  (amplitude ∝ `speedNow`, nulle en visée) ; rotation directe `camera.rotation.set(-pitch - reculV, yaw + reculH +
  Math.PI, 0, 'YXZ')` ; champ = `graphics.fov` (horizontal → vertical via l'aspect, même plafond que `champBase`) ×
  `zoomArme` en visée (lissé 0,12 s) ; +5° en sprint seulement hors visée.
- **Corps** : `p.mesh.visible = false` (comme la vue 1) ou os `Head` réduit (§ 5.2 b) ; `p.vuePremiere = true` pour
  garder les pas.
- **Arme de vue** : `sceneArme` + `cameraArme` (near 0,01, même champ « bras » fixe 55° pour ne pas déformer l'arme),
  passe insérée dans `fx.composer` après `gtao` (index 2) ; balancement, recul (piston arrière + montée), visée
  (interpolation hanche → œil), éclair de bouche (`fx.flash` léger ou sprite additif), douilles.
- **Tir** : rayon depuis l'œil, direction = yaw/pitch + dispersion ; contre le décor : `collisions.rayonLibre(…, 0)` ;
  contre les acteurs : boîtes/capsules tête-buste-jambes posées depuis les os (`bone('Head')`, `Spine2`, `Hips`) ;
  impact = décalque + étincelles ; marqueur de touche ; dégâts ; à 0,018 ms le rayon de décor, un fusil à pompe de
  8 plombs coûte 0,15 ms.

### 7.5 Les bots (js/bots.js) — ce que le cœur impose
- un bot = un `Player` de plus (avatars des amis de Haythem : `assets/*.glb` de LA CAGE, chargés pendant l'étape
  « joueurs ») piloté par une commande ; `Player.collisions` est partagé (statique) : `move` les fait glisser le long des
  murs comme Haythem, `solEn` les monte dans les escaliers (rampes continues) ;
- **portes** : elles ne s'ouvrent que pour `jeu.user` (piège 10) — il faut que `ch.portes.maj` reçoive la liste des
  acteurs, ou ouvrir les portes à demeure pendant une partie ;
- **niveaux et visibilité** : le niveau rendu est celui de Haythem (piège 11) ;
- **coût** : 0,64 ms par bot et par image en l'état (§ 1) ; animer à la cadence d'image et penser l'IA à 30 Hz.

### 7.6 Le prop hunt (js/partie_prop.js) — ce que le cœur impose
- **Prop** (Haythem ou bot déguisé) : `joueur.avatarModel.visible = false`, `joueur.vuePremiere = false` (plus de pas),
  `p.mesh` reste la racine (`userData.dynamique` déjà posé) mais le meuble va dans un groupe à part, sans le tangage ni
  le roulis des couches (piège 13), suivi dans `presenter` ; `p.h` réglé à la hauteur du meuble pour la caméra V2 (vue 3,
  la caméra naturelle d'un prop) ; vitesse ×0,8, pas de sprint ; « figer » (touche) = le meuble ne bouge plus et la
  caméra tourne librement autour.
- **Catalogue de déguisements** : les meubles du décor sont fusionnés (« décor cousu », hors de mon sujet) ; les
  emplacements de sièges (`{ x, z, y, fx, fz, nom, rang }`, 346 au total, voir piège 9) donnent un premier catalogue
  de places crédibles ; `deguiser` vise un meuble au rayon (comme le tir) et en prend la forme.
- **Chasseur** : vue FPS, tir sur un meuble suspect ; tirer sur un vrai meuble coûte de la vie (règle classique).
- **Provocations** : la roue des emotes (ui.js EmoteWheel, emotes.js) devient la roue des provocations (un son à la
  position du prop, `AudioFX` spatialisé).
- **Phases** : cachette (chasseurs aveuglés : `fx.flash`/un voile HTML, entrée ignorée), traque (chrono), fin.

### 7.7 Ordre de travail recommandé (chaque étape jouable)
1. `Input` : souris (boutons, molette), purge des fronts non liés et des fronts à la reprise (pièges 1-2) ; profils de
   touches (balade / combat) ; `pointerlockchange`.
2. `game.partie` + crochets (§ 7.2) + menu principal minimal (BALADE / FPS / PROP HUNT) — la balade reste le défaut.
3. Vue FPS sans arme (caméra directe, ±85°, corps orienté sur la visée, accroupi) ; régler la sensibilité.
4. Une arme : tir par rayon, réticule, munitions, recharge, recul ; passe de l'arme de vue ; sons spatialisés.
5. Un bot qui marche jusqu'à un point puis tire ; puis l'IA ; les portes pour tous.
6. Manches, score, fil des éliminations, tableau des scores, fin de partie.
7. Prop hunt (déguisement, phases, provocations).
8. Tactile et manette pour tout ce qui précède ; options COMBAT ; écran de chargement (sous-titre, astuces, liste,
   `VERSION` du service worker).
