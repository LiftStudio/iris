# IRIS — CONCEPTION DU FPS « RESSENTI CALL OF DUTY » (concepteur, 22/10/2026)

Base : IRIS master `a8b22dd` (v2.0), three r170, sans bundler. Lu en lecture seule : les cinq cartes (`carte_coeur.md`,
`carte_monde.md`, `carte_persos.md`, `carte_props.md`, `carte_cage.md`) et, pour vérifier les points d'accroche,
`js/game.js`, `js/input.js`, `js/settings.js`, `js/audio.js`, `js/player.js`, `js/collisions.js`, `js/fx.js`,
`js/ecole_portes.js`, `js/manette.js`, `js/main.js`, `js/ui.js`, `index.html`, `css/style.css`. Rien n'a été écrit dans
le dépôt. Les lignes citées sont celles de `a8b22dd`. Tout est chiffré ; les chiffres « à régler » sont des valeurs de
départ, à reprendre au stand de tir (lot 2).

Repère (celui d'IRIS) : monde X, Y vers le haut, Z = −y du plan ; `camYaw` = lacet, la caméra regarde vers
`-(sin yaw, ·, cos yaw)` ; `camPitch > 0` = regard vers le BAS. Gravité `G = 9.81` (`js/config.js:4`).

---------------------------------------------------------------------------------------------------------------------

## 0. EN UNE PAGE — LES DOUZE DÉCISIONS

1. **Zéro latence à la souris** : caméra posée directement (plus de lissage : 105 ms aujourd'hui), pointeur brut
   (`unadjustedMovement`), tangage ±85°, corps calé sur la visée à chaque pas. Cible : 1 image entre le geste et l'écran.
2. **Un temps pour tuer court et lisible** : 100 PV, 4 balles au corps pour le fusil d'assaut de près (240 ms), 3 à la
   tête ; régénération après 4 s. C'est ce qui fait « Call of Duty » plus que tout le reste.
3. **Cinq armes + couteau + deux grenades**, noms inventés (aucune marque) : FA-24 « Faucon » (fusil d'assaut),
   PM-9 « Guêpe » (pistolet-mitrailleur), FP-12 « Bélier » (fusil à pompe), TP-50 « Héron » (précision), P-17 « Moineau »
   (pistolet). Dégâts par zone et par distance en paliers, recul à MOTIF appris, dispersion de hanche dynamique.
4. **Déplacements CoD moderne** : course 5,0 m/s, sprint 6,6, sprint tactique 7,8 (3 s), glissade, accroupi, saut qui
   garde l'élan, franchissement des obstacles bas ; les escaliers d'IRIS (rampes continues) marchent déjà.
5. **Arme et bras de vue faits à la main en Three.js** (primitives, aucun fichier), en `SkinnedMesh` rigides pour tenir
   en 6 appels de dessin, dessinés dans leur scène et leur caméra (52°) par une passe insérée après `oeil` (`js/fx.js:618`).
6. **Les retours** : éclair de bouche + lumière préallouée, traceurs, impacts en `InstancedMesh`, douilles, son
   synthétisé et SPATIALISÉ (`PannerNode`, occlusion par les murs, retard du son à la distance), marqueur de touche,
   indicateurs de dégâts, vignette rouge, caméra de mort, puis killcam rejouée (lot 8).
7. **Bots sans triche** : ils ne savent que ce qu'ils voient (cône + ligne de vue sur le monde solide), entendent
   (tirs, pas) et subissent ; précision = modèle d'erreur angulaire qui se resserre, par difficulté (Recrue → Vétéran).
8. **Le monde en partie** : portes automatiques ouvertes à demeure (les bots arrivent 100 fois sur 100 au lieu de 64),
   ascenseur hors service, rue bornée à 6 m de la façade (la moitié des appels de dessin en moins là-bas).
9. **Modes** : Match à mort par équipes (SISR contre SLAM), Chacun pour soi, Domination (A hall, B pause du −1, C pause du
   1er), Stand de tir ; quatre zones de jeu (toute l'école, RDC + rue, le −1 seul, les étages) fermées par rubalise.
10. **Progression légère** : XP, 40 niveaux, 4 classes de départ + 5 perso, 1 atout, 3 séries (drone, gilet, sentinelle),
    médailles. Tout en `localStorage` (`iris.profil.v1`).
11. **Une partie = un objet** `game.partie` (la balade = `null`, inchangée), une commande par acteur et par pas, un état
    sérialisable, un hasard à graine, une file d'ÉVÉNEMENTS lue par l'affichage : l'hôte autoritaire de plus tard n'aura
    qu'à envoyer ces trois choses.
12. **Budget** : ≤ 7 bots sur PC, 3 au téléphone ; pose des bots une fois par IMAGE (pas à 120 Hz) ; ≤ 110 appels de
    dessin ajoutés ; préréglage « combat » (moyenne sans GTAO sur puce intégrée) ; `fx.calme = false` en plein combat.

---------------------------------------------------------------------------------------------------------------------

## 1. CE QUE « RESSENTI CALL OF DUTY » VEUT DIRE ICI (les cibles mesurables)

| Pilier | Cible | Comment on le mesure |
|---|---|---|
| Réponse de la visée | souris → caméra en ≤ 1 image ; 0 lissage | `performance.now()` au `mousemove` → `fx.render` ; aujourd'hui 105 ms pour 90 % du geste (`carte_coeur` § 1) |
| Cadence | 60 im/s visés, 45 au plancher (puce intégrée) | `fx` : `BUDGET_IMAGE` à 1000/60 en partie (`js/fx.js:454`) |
| Temps pour tuer (TTK) | 200-330 ms à moins de 15 m pour les armes automatiques | table § 5.2 (balles × intervalle) |
| Temps avant le premier contact | 6-12 s après une réapparition (4 contre 4) | chrono partie : réapparition → premier tir reçu/donné |
| Lisibilité | on voit d'où vient le tir (son à gauche/droite, indicateur, éclair) | test à l'aveugle au stand : 8 tirs autour de soi, direction devinée ≥ 7/8 |
| Boucle de récompense | marqueur + son à chaque touche, « +100 » à chaque élimination, médaille | chaque événement `touche`/`elim` produit ≥ 2 retours (visuel + son) |
| Rythme | ≈ 2 éliminations/min pour Haythem en Régulier, 4 contre 4 | statistiques de fin de partie |

---------------------------------------------------------------------------------------------------------------------

## 2. ARCHITECTURE — FICHIERS NOUVEAUX ET RETOUCHES

### 2.1 Nouveaux modules (tous en français, style d'IRIS : en-tête qui raconte, constantes nommées en tête)

| Fichier | Rôle | Taille estimée |
|---|---|---|
| `js/reseau_outils.js` | `Rng` (xorshift32, LA CAGE `js/net.js` l. 224-238), `mulberry32`, `hachage(a, b)` ; plus tard `Horloge`/`Tampon` | 80 l. |
| `js/partie.js` | classe `Partie` (base) : phases, chrono, scores, acteurs, commandes, `etat()`/`appliquer()`, file d'événements ; `lancerPartie`/`quitterPartie` | 450 l. |
| `js/partie_fps.js` | règles MME / CPS / Domination / Stand de tir, apparitions, zones de jeu, séries | 650 l. |
| `js/combattant.js` | un ACTEUR : `Player` + état de combat (vie, armes, accroupi, glissade…), boîtes de touche | 400 l. |
| `js/mouvement_fps.js` | applique une commande à un acteur : allures, sprint tactique, glissade, saut, franchissement | 300 l. |
| `js/armes.js` | FICHES d'armes (§ 5), machine d'état de l'arme, tir, recul, dispersion, recharge, couteau, grenades | 700 l. |
| `js/balistique.js` | `balle()` (DDA de la grille + sols + vitres + mobilier bas + corps), `vue()` (ligne de vue), normales | 300 l. |
| `js/modeles_armes.js` | les armes et les bras modélisés à la main (primitives → `SkinnedMesh` rigides), prises de main | 900 l. |
| `js/vue_fps.js` | caméra FPS, scène et caméra de l'arme, passe dans `fx`, balancement, recul visuel, animations 1re personne | 650 l. |
| `js/effets_fps.js` | éclairs, lumière préallouée, traceurs, impacts, étincelles, douilles, explosions (un `InstancedMesh` chacun) | 450 l. |
| `js/son_combat.js` | voix spatialisées (pool), recettes de tir par arme, impacts, rechargements, acouphène, occlusion | 450 l. |
| `js/nav.js` | graphe de navigation (`carte_monde` § 7), A*, ficelle, régions (47 zones, 46 passages) | 400 l. |
| `js/bots.js` | cerveau des bots : perception, mémoire d'équipe, décision, pilotage, tir | 900 l. |
| `js/hud_combat.js` | réticule, marqueurs, munitions, vie, mini-carte, fil, scores, tableau, fin de partie, carte de mort | 650 l. |
| `js/menu.js` | menu principal (BALADE / FPS / PROP HUNT / ARMURERIE / PROFIL / OPTIONS / CRÉDITS), réglages de partie | 450 l. |
| `js/profil.js` | XP, niveaux, déblocages, classes, défis, statistiques (`iris.profil.v1`) | 250 l. |

Environ 8 000 lignes au total (ordre de grandeur cohérent avec `carte_cage` § 6.5).

### 2.2 Retouches de l'existant (petites, toutes sans effet tant que `game.partie === null`)

| Fichier : ligne | Retouche |
|---|---|
| `js/game.js:507` `update` | après `memoriser`, `if (this.partie) { this.partie.pas(dt); return; }` (la partie mémorise ses acteurs) |
| `js/game.js:502` `interpoler` | `this.partie?.presenter(a)` (tous les acteurs) en plus de `user.presenter(a)` |
| `js/game.js:1005` `updateCamera` | en tête : `if (this.partie?.camera(dt, poser)) return;` |
| `js/game.js:451-458` `frame` | touches `phone` et `camera` ignorées si `this.partie` ; `this.partie?.image(dt)` après `interpoler()` (l. 474) |
| `js/game.js:478` | `this.carte.maj?.(…, this.partie?.jeuCarte ?? this)` — `jeuCarte = Object.create(game, { user: { get: () => suivi.p } })` : pendant la caméra de mort, la carte (portes, lampes, niveau rendu) suit l'acteur regardé sans toucher aux 17 lectures de `jeu.user` dans 8 modules |
| `js/game.js:487` | `this.fx.calme = !this.partie?.combat` (pas de remontée de qualité en plein échange) |
| `js/game.js:432` `togglePause` | boutons fournis par la partie (`Reprendre`, `Tableau`, `Options`, `Quitter la partie`) ; `input.purger()` en reprenant |
| `js/game.js:238-249` souris | en partie : pas de visée au glisser, tangage borné par `this.bornesTangage()` (±1,48 en FPS, −0,1/0,9 en balade), sensibilité FPS (§ 4.2) ; écoute `pointerlockchange` |
| `js/input.js:22-33` | boutons de souris (`Souris:0..4`), molette (`Molette:haut/bas`, front d'une image), `contextmenu` bloqué sur le canvas ; `purger()` ; `endFrame()` (l. 77) vide les fronts de codes non liés (piège 1) |
| `js/settings.js:8-23` `ACTIONS` | groupes « Combat » (tir, visee, recharger, interagirFps, arme, arme1, arme2, accroupi, couteau, letale, tactique, serie1-3, scores) ; profil `controls.bindingsFps` + `pad.bindingsFps` réparés dans `load()` (l. 88-119) ; `controls.fps = { sens: 0.45, sensVisee: 1.0, champ: 90, viseeMaintenue: true, accroupiMaintenu: false, sprintAuto: false, aideVisee: true, tirAuto: true (tactile) }` |
| `js/player.js:682` | `!this.sansRangs &&` avant `_entrerRang` (les bots ne se faufilent pas dans les rangs) |
| `js/player.js:686` | `sp *= this.sprintMul ?? 1.32` (sprint tactique) |
| `js/player.js:693-696` | en l'air : `if (this.elanAir) { τ = 0.45 s, vitesse cible non réduite }` au lieu de `sp *= 0.35` (le saut garde l'élan) |
| `js/player.js:1068-1137` `update` | drapeau `poseParImage` : hors `Player.poseVisible`, seuls le saut et les minuteries avancent, le reste du `dt` est cumulé pour la pose suivante (bots : 0,64 → ≈ 0,15 ms par image et par bot) |
| `js/couches.js:124, 328` | `p.mesh.visible || p.vuePremiere || p.audible` (un bot caché par zone reste audible) |
| `js/ecole_portes.js:594` | `const veut = P.force ?? (…)` : `force = true` ouvre à demeure, `false` verrouille (prop hunt : porte 6) |
| `js/ecole_ascenseur.js:456` | `if (ch.ascenseurHorsService) return;` en tête de `majAscenseur` + panneau « HORS SERVICE » |
| `js/fx.js:454` | `BUDGET_IMAGE` devient `this.budgetImage` (45 im/s en balade, 60 en partie) |
| `js/fx.js:618` | point d'insertion de la passe de l'arme (`insertPass(passeArme, 3)`, après `oeil`, § 6.6) ; chemin direct (l. 2062) : `autoClear = false ; clearDepth() ; render(sceneArme, camArme)` |
| `js/audio.js` | un tampon de bruit blanc unique (1 s) au lieu d'un par appel (l. 73) ; sortie spatialisée commune (`son_combat.js`) |
| `js/manette.js:338`, `js/touch.js:422` | bornes du tangage lues sur `game.bornesTangage()` |
| `js/ecole_lumieres.js:44` | une `PointLight(0xffc27a, 0, 4.5, 2)` préallouée (PC seulement, `castShadow = false`) AVANT la précompilation : éclairs et explosions (§ 7.2) |
| `js/main.js:84` `commencer` | ouvre le menu principal au lieu de `enterLobby()` (la balade devient le premier bouton) |
| `index.html:207-216`, `css/style.css:139+` | blocs du HUD de combat, `#menu`, `#tableau`, `#fin-partie`, `#mort` ; `body.combat` cache `.stamina`, `.keys`, `#phone-badge` |
| `js/manette_menus.js:16-20` | `RACINES` += `menu`, `fin-partie` ; `RETOUR`/`DEFAUTS` |
| `sw.js:8`, `tools/liste_chargement.py` | `VERSION = 'iris-v3.0'`, nouveau relevé `?chargement=trace` |

### 2.3 Le pas de simulation d'une partie (120 Hz, dans `update`)

```
Partie.pas(dt)                                      (n'est PAS appelé en pause : le chrono et les bots gèlent)
  1. pour chaque acteur : p.memoriser()
  2. commandes : Haythem ← lireCommande(input, game) (seul lecteur d'Input en partie) ;
                 bots ← cerveau.commande(dt) (pensée à 20 Hz étalée, pilotage à 120 Hz) ; plus tard : réseau
  3. mouvement_fps.appliquer(acteur, c, dt)         (allure, setFacing(yaw), move, saut, glissade, franchissement)
  4. armes.pas(acteur, c, dt)                       (état de l'arme, tirs → balistique → dégâts → ÉVÉNEMENTS)
  5. projectiles (grenades), séries actives (tourelle), zones (Domination)
  6. règles : vie/régénération, éliminations, réapparitions, chrono, fin de manche
  7. p.update(dt) de chacun (Haythem à chaque pas ; bots : poseParImage)
  8. tick++
Partie.image(dt) (une fois par image, après interpoler) : lit et VIDE la file d'événements → effets, sons, HUD ;
  arme de vue, mini-carte, visibilité des bots (zoneDe/zonesCachees), plaques de noms.
```
Ni `Player`, ni les armes, ni les bots ne lisent `Input` ; l'affichage ne lit que l'état et les événements. C'est la
couture de LA CAGE (`js/game.js` l. 1153-1158 de LA CAGE) et celle de l'hôte autoritaire de plus tard.

---------------------------------------------------------------------------------------------------------------------

## 3. DÉPLACEMENTS

### 3.1 Les allures (m/s) — × mobilité de l'arme en main

Mobilité : P-17 1,08 · PM-9 1,06 · FA-24 1,00 · FP-12 1,00 · TP-50 0,92 · couteau seul 1,10.

| Allure | Vitesse (FA-24) | Réglage dans `Player` | Remarques |
|---|---|---|---|
| Marche (touche marcher / stick à moins de 58 %) | 2,15 | `p.marche = true` (plafond du clip, `player.js:689`) | silencieuse pour les bots au-delà de 4 m |
| Course (défaut) | **5,00** | `p.speedMul = v / 5.476` (fiche HAYTHEM : 3,1 + 0,99 × 2,4 = 5,476, `player.js:684`) | |
| Sprint (Maj tenu) | **6,60** | sprint vrai, `sprintMul` 1,32 (celui d'aujourd'hui) | illimité ; tir impossible ; arme baissée |
| Sprint tactique (double appui sur Maj en < 0,30 s, ou L3 double) | **7,80** | `sprintMul = 1.56` | 3,0 s (PM-9 et P-17 : 4,5 s ; atout Endurance ×2) ; recharge pleine en 4 s, utilisable dès 1,2 s |
| Visée (ADS) | 2,40 (PM-9 2,90 · P-17 3,10 · FP-12 2,50 · TP-50 1,60) | `speedMul` | pas de sprint en visée |
| Accroupi | 2,30 ; accroupi + visée 1,50 | `speedMul` | silencieux pour les bots |
| Glissade | entrée = max(v, 6,6) × 1,12 (plafond 8,8), 0,75 s | voir 3.3 | |
| En l'air | élan gardé (τ 0,45 s vers la commande) | `elanAir` (`player.js:693`) | aujourd'hui ×0,35 : on perd l'élan en sautant |

Inertie au sol inchangée (τ 0,13 s pour partir, 0,085 s pour s'arrêter, `player.js:696`) : c'est déjà nerveux.
Endurance neutralisée en partie : `p.staminaMul = 0` et `p.stamina = 100` à chaque pas (sinon `gasMul` ralentit jusqu'à
×0,78 et les couches posent « mains sur les genoux », `couches.js:186-191`).

### 3.2 Accroupi, œil, glissade : les hauteurs

| État | Œil (au-dessus des pieds) | Transition | Boîtes de touche |
|---|---|---|---|
| Debout | **1,60 m** | — | tête vers 1,64-1,75 |
| Accroupi | **1,08 m** | 0,16 s (courbe douce), remontée 0,18 s ; refusée si `plafondEn` < pieds + 1,85 au-dessus | os réels (accroupi procédural, `banc/accroupi.js`) |
| Glissade | **0,85 m** | descente 0,12 s, remontée 0,20 s | idem, buste penché |

Accroupi : appui bref = bascule (réglage `accroupiMaintenu`) ; pose du corps pour les autres = `accroupir(p, k)` du banc
(hanches −0,42 m, `ikJambe`, 0,35 ms) appliquée sur le dernier pas.

### 3.3 La glissade (le geste « moderne » de CoD)

- Condition : en sprint depuis ≥ 0,25 s, au sol, vitesse ≥ 6,0 m/s, `accroupi` pressé ; recharge 0,9 s.
- Vitesse : `v(t) = v0 × (1 − t/0.75)^0.6` avec `v0 = min(8.8, max(v, 6.6) × 1.12)`, direction FIGÉE à l'entrée (on peut
  tourner la tête, pas la trajectoire) ; à la fin, accroupi à 2,3 m/s.
- Mise en œuvre sans nouveau code de collision : `p.vel.multiplyScalar(1.12)` à l'entrée, puis à chaque pas
  `move(dirFigee, true, dt)` avec `speedMul = v(t) / (5.476 × 1.32)` — l'inertie de 0,13 s fait le reste, les murs
  glissent comme d'habitude (`C.deplacer`).
- Annulation : saut (garde 85 % de la vitesse), ou se relever (accroupi relâché en mode maintenu).
- Caméra : roulis 4° vers le côté de la main faible, champ +4°, œil 0,85 m, son de frottement (bruit passe-bande
  700 Hz, 0,6 s, `son_combat`). Tir permis (dispersion de hanche ×1,3), pas de visée avant 0,35 s.
- Interdite sur une rampe de pente > 0,4 (les volées : 0,48-0,77) : on y court.

### 3.4 Saut, plafonds, réceptions

- `jump(3.15)` → apogée 0,505 m, 0,64 s en l'air (aujourd'hui 2,6 → 0,345 m). Borné : vitesse réduite pour que la tête
  (pieds + 1,73) reste à 8 cm sous `plafondEn(x, z, pieds)` (`collisions.js:153`) — 1 258 nœuds sont sous un plafond à
  2,2-2,4 m (`carte_monde` piège 13).
- Pénalités : dispersion de hanche « saut » (§ 5.4), visée impossible pendant 0,1 s après le décollage.
- Réception d'une chute > 0,3 m : vitesse ×0,85 pendant 0,12 s, caméra qui plonge de 3 cm (ressort ω 22, ζ 0,7), arme qui
  plonge de 2,5 cm. Pas de dégâts de chute (3 m au plus dans l'école).

### 3.5 Franchissement (« enjamber », lot 3)

- Obstacles visés : tables, bureaux, banquettes, comptoir de l'accueil, jardinières et bancs de la rue — les formes
  `joueur` basses (75 formes `camera:false` de 0,56 à 0,95 m, `carte_cage` § 3) et les boîtes dont `y1 − pieds` est entre
  0,45 et 1,15 m.
- Test (quand on saute face à l'obstacle, ou sprint + avancer contre lui pendant 0,15 s) : sonde `C.deplacer` de 0,5 m
  vers l'avant bloquée à moins de 0,8 m ; `rayonLibre` à hauteur `y1 + 0,25` libre sur 1,4 m ; point d'arrivée à
  0,9-1,3 m au-delà `C.libre(x, z, 0.3, sol)` vrai avec `|solEn − pieds| < 0,3`.
- Mouvement scripté : 0,45 s (0,38 s pour un obstacle < 0,7 m), arc de caméra +0,35 m, arme baissée et inclinée 25°,
  vitesse de sortie = 70 % de l'entrée. Les rangs serrés (blocs pleins, arrivée jamais libre) sont refusés d'eux-mêmes.
- Pas de position couchée : le monde solide ne connaît pas le dessous des tables (formes verticales pleines).

### 3.6 Escaliers et paliers

Rien à faire pour la physique : `solEn` suit les rampes continues (`carte_monde` § 5). Caméra : l'œil suit `solAff`
(interpolé) ; seuls les sauts de sol (bordure de trottoir 0,12 m, dalles) sont lissés en montée (amortisseur critique
0,08 s), jamais en descente (sinon on « flotte »). Pas de ralentissement dans les volées (CoD n'en a pas).

---------------------------------------------------------------------------------------------------------------------

## 4. CAMÉRA, VISÉE, SENSIBILITÉ

### 4.1 La caméra FPS (`vue_fps.js`, appelée par `partie.camera(dt, poser)`)

```js
// œil = position AFFICHÉE + hauteur d'œil lissée + balancement ; rotation DIRECTE (aucun lerp)
cam.position.set(p.posAff.x, p.solAff + oeil(k) + p.jumpY + bob.y, p.posAff.z) ;  // + bob latéral sur l'axe droit
cam.rotation.set(-(pitch + reculVue.p), yaw + reculVue.y + Math.PI, roulis, 'YXZ') ;
cam.fov = champV(champReglage, aspect) / zoomCourant ;                             // § 4.3
p.mesh.visible = false ; p.vuePremiere = true ;                                    // comme la vue 1 (game.js:1031)
```
- `pitch`/`yaw` = `game.camPitch`/`camYaw` tels qu'écrits par les écouteurs de souris depuis l'image précédente : la
  rotation est posée À L'IMAGE (pas au pas de simulation), donc le geste arrive à l'écran à l'image suivante.
- Balancement de la CAMÉRA (petit, c'est l'arme qui bouge) : fréquence des pas `f = 1,15 + 0,35 × v` (Hz ; 2,9 à la course,
  3,5 au sprint), vertical 1,0 cm (course) / 1,8 cm (sprint), latéral 0,6 cm, roulis 0,4° ; ×0,1 en visée ; nul à l'arrêt.
- Roulis : 4° en glissade, 1,5° en sprint tactique, 0 sinon (le roulis permanent donne le mal de mer).
- Champ : +5° en sprint (hors visée), +4° en glissade, lissés 0,15 s.
- Secousses (`game.addShake`, `game.js:494`) : explosions seulement ; le recul n'est PAS une secousse (§ 5.5).

### 4.2 La souris (réglages `controls.fps`)

- Capture : `canvas.requestPointerLock({ unadjustedMovement: true })` (promesse ; repli sans option sur
  `NotSupportedError`) ; écouter `pointerrawupdate` quand il existe (Chrome), sinon `mousemove`.
- **Sensibilité FPS séparée** (la balade garde la sienne) : `0,0025 × sens` rad/px en lacet ET en tangage (aujourd'hui
  0,002 en tangage, `game.js:247` : en FPS le même rapport sur les deux axes). Défaut `sens = 0,45` → 5 585 px par tour,
  soit 18 cm/360° à 800 ppp, 9 cm à 1 600 ppp ; l'écran d'options affiche « cm par tour à 800 ppp » à côté du curseur
  (0,1-2,0).
- Tangage borné à ±1,48 rad (85°). Pics `|movementX| > 400 px` ignorés (sauts de Chrome sous Windows).
- `pointerlockchange` : pointeur perdu en partie hors pause → `togglePause()` (le 1er Échap est avalé par le navigateur) ;
  la recapture attend 1,1 s après une sortie par Échap (Chrome refuse avant) ; le clic qui recapture ne tire pas
  (`Souris:0` ignoré pendant 0,2 s après la capture).

### 4.3 Champ et visée (ADS)

- Réglage `champ` = champ HORIZONTAL équivalent 16:9, défaut **90°** (vertical 58,7°), 75-110°. Conversion :
  `champV = 2·atan(tan(champ/2) / (16/9))`, puis le plafond horizontal actuel (108°) pour les écrans très larges.
- Zoom de visée (sur la tangente) : P-17 ×1,10 · PM-9 ×1,15 · FA-24 ×1,25 (×1,30 avec le point rouge) · FP-12 ×1,10 ·
  TP-50 ×4,0 (lunette). Passage hanche ↔ visée selon le temps d'ADS de l'arme (§ 5.2), courbe `1 − (1 − t)³`.
- Sensibilité en visée : `k = tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee` (défaut 1,0, 0,5-1,5) : la cible
  « glisse » à la même vitesse à l'écran quel que soit le zoom.
- Lunette du TP-50 : à 85 % de l'ADS, le viewmodel est caché et un masque HTML (`#hud-lunette` : disque transparent
  dans un fond noir, réticule fin en CSS, vignettage) prend l'écran ; balancement en huit de 0,25° à 0,5 Hz ; **retenir
  son souffle** (Maj en visée) : balancement ×0,1 pendant 4 s, puis ×1,5 pendant 2 s (et le cœur s'entend).

### 4.4 Manette (CoD « par défaut »)

- Stick droit : 3,6 rad/s (206°/s) au maximum à `sens` 1 (aujourd'hui 2,9), courbe ^1,8 et zone morte 0,12 conservées
  (`manette.js:334-340`) ; **accélération de virage** : stick > 0,9 pendant 0,25 s → ×1,35 en 0,3 s ; visée ×0,55.
- **Aide à la visée** (manette et tactile seulement, réglage `aideVisee`) :
  - ralentissement ×0,55 (×0,7 à la hanche) quand le centre de l'écran est à moins de `atan(0,45/d) + 1°` du buste d'un
    ennemi visible à ≤ 40 m ;
  - suivi : on ajoute 45 % de la vitesse angulaire de la cible quand le stick droit est actif ;
  - aimant d'ADS : en début de visée, cible à moins de 7° et 30 m → la visée tourne de 70 % de l'écart pendant le temps
    d'ADS. Jamais à la souris.

### 4.5 Tactile (façon CoD Mobile)

TIR en rôle mixte « bouton + regard » (on vise en glissant sur le bouton de tir, `touch.js:296-337`), VISER, ACCROUPI
(glisser en sprint = glissade), SAUT, RECHARGER, ARME (tape sur le cadre des munitions), GRENADE, TACTIQUE, COUTEAU,
SCORES ; sprint verrouillé en poussant le joystick au-delà de son bord (= sprint tactique quand il est prêt).
**Tir auto** (défaut au tactile) : tir quand le réticule reste 0,12 s sur un ennemi à ≤ 30 m. Contexte par mode dans
`_contexte()` (`touch.js:224`).

---------------------------------------------------------------------------------------------------------------------

## 5. LES ARMES

### 5.1 La fiche (`armes.js`) — tout ce qu'une arme est, en nombres

```js
// FA-24 « Faucon » — le fusil d'assaut de base (toutes les distances de l'école)
{ id: 'fa24', nom: 'FA-24 « Faucon »', classe: 'fa', emplacement: 'principale', auto: true, rpm: 750,
  degats: [[15, 30], [30, 24], [Infinity, 20]],         // [jusqu'à (m), dégâts]
  zones: { tete: 1.4, cou: 1.2, torse: 1.1, ventre: 1.0, bras: 0.9, jambe: 0.9 },
  chargeur: 30, reserve: 90, plombs: 1,
  ads: 0.26, sprintTir: 0.20, sprintTactTir: 0.30, mobilite: 1.00, zoom: 1.25,
  recharge: { tact: 1.90, vide: 2.45, ajout: 1.35 },   // ajout = moment où les balles entrent (annulable avant)
  sortie: 0.30, rangement: 0.20,
  dispersion: { repos: 2.2, marche: 3.4, course: 4.6, sprint: 5.5, saut: 8.0, parTir: 0.30, max: 3.0, retour: 7.0,
                visee: 0.0, viseeMouv: 0.15, accroupi: 0.8 },  // demi-angles en degrés ; retour en °/s
  recul: { motif: FA24_MOTIF, boucle: 6, alea: 0.08, visee: 0.8, accroupi: 0.85, rappel: 0.40, rappelT: 0.30,
           piston: 0.028, cabre: 2.2, roulis: 1.0 },
  bruit: 45,                                            // m : rayon où les bots l'entendent (silencieux : 8)
  son: 'fa' }
```

### 5.2 L'arsenal (les cadences et les distances sont faites pour l'école : couloirs de 10-25 m, rue bornée ≈ 26 m)

| | FA-24 Faucon | PM-9 Guêpe | FP-12 Bélier | TP-50 Héron | P-17 Moineau |
|---|---|---|---|---|---|
| Classe | fusil d'assaut | pistolet-mitrailleur | fusil à pompe | précision (à verrou) | pistolet (secondaire) |
| Tir | auto 750 cps/min (80 ms) | auto 900 (66,7 ms) | pompe 70 (857 ms) | verrou 45 (1,33 s) | semi, 400 max (150 ms) |
| Dégâts (m : dégâts) | ≤15 : 30 · ≤30 : 24 · au-delà 20 | ≤8 : 26 · ≤16 : 20 · 15 | 8 plombs × (≤5 : 18 · ≤9 : 11 · ≤14 : 6 · 0) | 105 partout | ≤10 : 34 · ≤20 : 25 · 20 |
| Tête / cou / torse / ventre / membres | 1,4 / 1,2 / 1,1 / 1,0 / 0,9 | 1,25 / 1,1 / 1,0 / 1,0 / 0,9 | 1,0 partout | 2,0 / 1,5 / 1,0 / 0,9 / 0,75 | 1,5 / 1,2 / 1,0 / 1,0 / 0,9 |
| Balles pour tuer au corps (près / moyen / loin) | 4 / 5 / 5 | 4 / 5 / 7 | 1 (≥ 6 plombs) / 2 / 3 | 1 au-dessus du ventre, 2 sinon | 3 / 4 / 5 |
| TTK au corps de près | **240 ms** | **200 ms** | 0 ou 857 ms | 0 ou 1,33 s | 300 ms |
| Chargeur / réserve | 30 / 90 | 32 / 96 | 7 / 21 | 5 / 20 | 12 / 48 |
| ADS · sprint→tir | 0,26 · 0,20 s | 0,20 · 0,13 | 0,26 · 0,18 | 0,42 · 0,32 | 0,15 · 0,10 |
| Rechargement tact. / à vide (balles entrées à) | 1,90 / 2,45 (1,35) | 1,65 / 2,15 (1,15) | 0,35 + 0,42/cartouche + 0,30 (+0,45 pompe à vide), interruptible | 2,30 / 2,90 (1,70) | 1,30 / 1,65 (0,90) |
| Sortie / rangement | 0,30 / 0,20 s | 0,25 / 0,18 | 0,32 / 0,22 | 0,38 / 0,25 | 0,20 / 0,15 |
| Zoom de visée | ×1,25 | ×1,15 | ×1,10 | ×4,0 (lunette) | ×1,10 |
| Mobilité | 1,00 | 1,06 | 1,00 | 0,92 | 1,08 |

Plus :
- **Couteau** (V / R3) : 150 dégâts (tue), portée 1,6 m, **fente** jusqu'à 2,4 m si un ennemi est dans un cône de 25°
  (on est tiré vers lui à 6 m/s pendant 0,15 s au plus), 0,60 s par coup (touche à 0,12 s).
- **Grenade à fragmentation** (G / RB) : 1 par vie (Assaut : 1 ; atout possible 2) ; maintenir = goupille tirée,
  **mèche 3,5 s qui court dans la main** (elle explose en main à 3,5 s) ; lancer 15 m/s dans l'axe + 2,5 m/s vers le haut,
  rebonds (restitution 0,35, frottement 0,6), arrêt sous 0,4 m/s ; **160 dégâts à ≤ 2,0 m, décroissance linéaire jusqu'à
  25 à 6,5 m**, ligne de vue exigée (centre + 0,3 m → buste ou tête) : un mur protège ; dégâts à soi comptés.
- **Grenade flash** (Q physique = A en AZERTY / LB) : 2 par vie, mèche 1,6 s, rayon 14 m avec ligne de vue ;
  aveuglement `0,8 + 3,2 × face × (1 − d/14)` s (face = 0 dos tourné, 1 en plein regard), plafonné 4 s : `fx.flash`
  tenu à 1 (`js/fx.js:647, 2017`) puis relâché, son étouffé (passe-bas 300 Hz sur la sortie) + acouphène ; un bot aveuglé
  ne perçoit plus rien et tire 20 % du temps vers la dernière position connue.

Rechargement annulé par le sprint, un changement d'arme ou le couteau tant que les balles ne sont pas entrées
(`ajout`) ; « tactique » = il restait des balles (une de plus dans la chambre : chargeur + 1, comme CoD). Arme ramassée :
maintenir Interagir 0,35 s sur l'arme d'un mort (au sol 20 s) ; passer dessus avec la même arme = +1 chargeur.

### 5.3 Le tir (`balistique.js`) : hitscan contre le monde solide, jamais le `Raycaster`

Tout est instantané (au plus 60 m dans l'école : une vraie balle à 800 m/s y met 75 ms ; les traceurs montrent une
vitesse, § 7.3). Origine = **l'œil** du tireur (jamais le bout du canon, qui peut être dans un mur : `carte_monde`
piège 10).

```js
// la balle de A dans la direction d (normée) sur `portee` m : le PREMIER obstacle
balle(ax, ay, az, dx, dy, dz, portee = 80, tireur) → { t, x, y, z, nx, ny, nz, surface: 'mur'|'sol'|'plafond'|'vitre'|'meuble', forme, corps: { acteur, zone } | null }
```
1. **Murs, meubles, plafonds** : le DDA de la grille de 2 m (`carte_monde` § 6, 7,9 µs), mais en gardant le plus proche
   impact (sortie quand le meilleur `t` est avant la sortie de la case) ; formes `joueur || camera` (les meubles bas de la
   rue et les tables comptent, piège 8), sauf `off` et le nouveau drapeau `balle: false` (le « jour » de l'escalier,
   `carte_ecole.js` l. 628). Normale = face d'entrée : l'axe de la tranche qui a donné `t0` dans une copie de
   `_segment` (`collisions.js:300-338`) qui rend aussi cet axe ; cylindre → radiale.
2. **Vitres** (51 formes `vitre`) : la balle passe à 80 % des dégâts, une fêlure (impact « vitre ») est posée ; les portes
   vitrées ouvertes à demeure ne gênent pas.
3. **Sols** : les 53 sols de `C.sols` (dalles = rectangles horizontaux, rampes = plans inclinés bornés) et le plan
   `y = 0` là où `solEn(x, z, 0.1) === 0` (`carte_monde` § 6 : sinon un tir vers le bas traverse le −1 et la rue).
4. **Corps** : préfiltre cylindre 1,1 m autour de chaque acteur ennemi vivant, puis les 12 capsules sur les os
   (`banc/touches.js`, 1,6 µs) ; capsules ANALYTIQUES (calculées de `pos`, cap, accroupi) pour un acteur dont la pose
   date de plus de 0,1 s (bot hors de vue, posé à 4 Hz). Le plus proche gagne, s'il est avant le mur. Alliés traversés.
- Coûts : 30-100 µs le rayon ; FP-12 = 8 rayons ≈ 0,5 ms ; 7 bots qui tirent : < 0,2 ms par image.
- Pas de tir à travers les murs (pas de matière connue) ; « Munitions perforantes » éventuelles plus tard.

### 5.4 La dispersion de hanche (dynamique)

- Demi-angle courant `s = base(état) × (accroupi ? 0,8 : 1) + chaleur`, `base` interpolée en 0,12 s entre repos, marche
  (v > 0,3), course (v > 3), sprint→tir (pendant `sprintTir`), saut (en l'air) ; `chaleur += parTir` à chaque tir
  (plafond `max`), décroît de `retour` °/s.
- Tirage : `r = s × √u`, `θ = 2πv` (disque uniforme), `u, v` du `Rng` de la partie, graine du tir = `hachage(id, tirSeq)`
  (le même sur l'hôte et l'invité plus tard).
- En visée : `visee` (immobile) / `viseeMouv` (en mouvement) ; FP-12 : gerbe fixe (1 plomb au centre + 7 en couronne à
  0,6 × cône) tournée au hasard, ±0,3° de jitter, cône 5,0° hanche / 3,6° visée ; TP-50 : 8° à la hanche (tir « au jugé »).
- Réticule (§ 9.1) : écart en pixels `= tan(s) / tan(champV/2) × H/2` : il dit la vérité.

### 5.5 Le recul : un MOTIF appris + un retour visuel

- **Recul de visée** (déplace vraiment la visée : on compense en tirant vers le bas, c'est l'apprentissage) : au tir n°
  `i`, `camPitch −= v[i] × k`, `camYaw −= h[i] × k` (degrés → radians ; `k` = visée 0,8 × accroupi 0,85), au-delà du
  motif on boucle sur ses `boucle` derniers tirs avec ±`alea`. Appliqué par le TIREUR sur ses propres angles (un bot le
  compense selon sa difficulté, § 8.4).
- **Rappel** : 300 ms après le dernier tir, 40 % du recul vertical accumulé revient en 0,30 s (CoD 4 ; réglable par arme).
- Motifs (degrés par tir ; `v` vers le haut, `h` positif = vers la droite) :
  - FA-24 : `v` = 0,45 0,50 0,55 0,60 0,62 0,62 0,60 0,58 0,58 0,56 0,55 0,55 ; `h` = +0,05 +0,08 +0,10 +0,06 −0,04 −0,12
    −0,18 −0,15 −0,05 +0,10 +0,18 +0,12 (boucle sur les 6 derniers) → 6,8° de montée sur 12 balles, un « 7 » à apprendre.
  - PM-9 : `v` = 0,30 0,32 0,34 0,36 0,38 0,40 puis 0,40 ; `h` en zigzag ±0,10 → ±0,22 (vibrant, peu de montée).
  - P-17 : `v` 1,1, `h` ±0,25 au hasard, rappel 80 % en 0,20 s.
  - FP-12 : `v` 4,5, `h` ±0,8, rappel 100 % en 0,45 s. TP-50 : `v` 6,0, `h` ±0,5, rappel 100 % en 0,60 s.
- **Retour visuel** (ne touche pas la visée) : l'arme de vue recule de `piston` (FA-24 2,8 cm, PM-9 2,0, P-17 3,5,
  FP-12 6,0, TP-50 5,0), se cabre de `cabre` (2,2° / 1,6 / 4,0 / 8,0 / 6,0), roulis aléatoire ±`roulis`° ; ressort amorti
  ω 35 rad/s, ζ 0,55 (la forme du ressort de `hoopfx.js` de LA CAGE) ; la caméra reçoit 15 % du cabré (« punch ») qui
  revient en 0,08 s.

### 5.6 La machine d'état d'une arme (par acteur)

`pret → tir (cadence) → pret` · `recharge (t, ajout) → pret` · `change (rangement puis sortie)` · `sprint (baissée ;
sprintTir à la sortie)` · `couteau` · `grenade (goupille, cuisson, lancer 0,35 s)` · `franchit`. Tout en minuteries dans
l'état (sérialisable) ; aucune animation ne commande la règle (l'animation LIT l'état : § 6.4).
Armes automatiques par `down('tir')`, semi-auto par front (`pressed`) avec tampon de 0,1 s (un clic un peu tôt part
quand même au bout de la cadence), visée maintenue par défaut (bascule en option), tir en sprint = la sortie du
sprint puis le tir après `sprintTir`.

---------------------------------------------------------------------------------------------------------------------

## 6. L'ARME DE VUE (VIEWMODEL) — MODÉLISÉE À LA MAIN EN THREE.JS

### 6.1 Principe : des primitives cousues en `SkinnedMesh` RIGIDES

Un maillage par pièce = un appel de dessin par pièce (≈ 25-45 µs chacun, `carte_props` § 4) : une main faite de 16
phalanges coûterait 30 appels. Donc chaque modèle est construit en pièces (`BoxGeometry` arrondies à la main,
`CylinderGeometry`, `LatheGeometry`, `ExtrudeGeometry` de profils 2D), chaque pièce rattachée à UN os (poids 1 ; 2 os en
fondu sur 3 cm au coude et au poignet), puis **cousues par matériau** (`mergeGeometries` + groupes) dans un seul
`SkinnedMesh` : bras = 2 appels (gant, manche), arme = 3-4 appels (acier, polymère, teinte, verre émissif). Viewmodel
complet ≈ 6 appels, hors ombres et hors GTAO (scène à part).

### 6.2 Les armes (mètres ; origine = point de prise de la main droite sur l'axe, −Z = vers la bouche)

| Arme | Encombrement | Pièces | Os mobiles | Prises (`mainD`, `mainG`), `bouche`, `visee`, `ejection` |
|---|---|---|---|---|
| FA-24 | 0,84 m | boîtier 0,05 × 0,075 × 0,28, garde-main à rails 0,056 × 0,06 × 0,26, canon r 0,011 × 0,10 + cache-flamme, crosse en profil extrudé 0,24, poignée pistolet inclinée 18°, chargeur courbe (profil d'arc extrudé) 0,20, point rouge (boîtier creux + point émissif `0xff2a1a`, `toneMapped: false` : le bloom le fait briller) | `chargeur`, `culasse` (levier d'armement), `detente` | mainD (0, 0, 0) · mainG (0, −0,025, −0,34) · bouche (0, 0,035, −0,64) · visee (0, 0,088, −0,08) · ejection (0,03, 0,05, −0,06) |
| PM-9 | 0,62 m | boîtier compact, crosse en fil repliée, chargeur droit 0,17, garde-main court 0,16, viseur à fenêtre | `chargeur`, `culasse` | mainG (0, −0,03, −0,24) · bouche (0, 0,03, −0,40) · visee (0, 0,075, −0,05) |
| FP-12 | 0,95 m | canon + tube magasin dessous, pompe 0,18 (coulisse de 9 cm), crosse, guidon perle | `pompe`, `detente` | mainG sur la pompe (0, −0,03, −0,42) · bouche (0, 0,03, −0,78) |
| TP-50 | 1,10 m | canon long, lunette r 0,022 × 0,32 (lentilles en verre à reflet), culasse à levier (tourne de 60° puis recule de 8 cm), bipied replié | `culasse`, `chargeur` | mainG (0, −0,03, −0,36) · bouche (0, 0,03, −0,85) · visee (0, 0,075, −0,02) |
| P-17 | 0,19 m | glissière 0,028 × 0,035 × 0,19, carcasse, poignée 15°, cran et guidon à points blancs | `glissiere` (recule de 3 cm au tir), `chargeur` | mainG = prise à deux mains (−0,02, −0,04, 0,01) · bouche (0, 0,035, −0,13) · visee (0, 0,058, 0,04) |
| Couteau | 0,29 m | lame extrudée (biseau), garde, manche texturé | — | mainD seule |
| Grenades | Ø 0,07 / 0,04 × 0,12 | sphère quadrillée + cuillère + anneau ; cylindre à trous | `goupille` | mainD ; mainG tire l'anneau |

Matériaux partagés : `acier` (`0x24272b`, métal 0,85, rugosité 0,38), `polymere` (`0x2b2d30`, 0 / 0,72), `teinte` par arme
(FA-24 terre `0x9a8665`, PM-9 noir, FP-12 vert `0x5b5f45`, TP-50 sable, P-17 noir) — c'est le matériau que les camouflages
remplacent (textures de toile 256² peintes en code : « Damier SIO », « Tigre », « Or ») ; `verre` émissif. Le même modèle
sert aux bots (version sans os mobiles, une géométrie par matériau) tenu par la pose procédurale validée
(`banc/armer.js` : buste + `ikBras` sur poignée et garde-main, garde-main à 0,40 m au plus de la crosse).

### 6.3 Les bras (faits à la main ; repli : ceux coupés dans `haythem.glb`)

- Squelette par bras : épaule (fixée hors champ, (±0,19 ; −0,20 ; +0,12) dans le repère caméra), coude, poignet,
  5 doigts × 3 phalanges (36 os pour les deux bras). Longueurs : bras 0,29, avant-bras 0,27 (une portée de 0,56 m qui
  atteint le garde-main ; le bras réel de Haythem fait 0,479 m, `carte_persos` § 4.7, trop court en vue FPS).
- Pièces : manche en `LatheGeometry` (profil r 0,055 → 0,048 avec revers au poignet), avant-bras, gant (paume arrondie
  0,085 × 0,03 × 0,095, coque de dos de main, renforts aux phalanges), doigts en `CapsuleGeometry` r 0,0095 (0,045 /
  0,028 / 0,022), pouce 3 segments : ≈ 5 000 triangles. Couleurs : manche du sweat de Haythem (réglage, défaut
  anthracite `0x3a3d42`), gants noirs `0x1b1c1e` ; option « mains nues » (teint `#c68642` de la fiche HAYTHEM).
- **IK deux os analytique** dans le repère de la caméra : poignet sur la prise de l'arme (`mainD`, `mainG` ou une cible
  d'animation), coude vers (0,3 ; −1 ; 0,2) à droite, (−0,4 ; −1 ; 0) à gauche ; main orientée par le repère de la prise.
- **Prises** (angles des phalanges, table) : `poignee` (index sur la détente : 0,35 rad, 0,6 au tir), `garde_dessous`,
  `garde_c`, `pompe`, `pistolet_appui`, `couteau`, `grenade`, `chargeur` (main gauche qui saisit), `ouverte`.
- Repli : `couperBras()` du banc (`banc/bras_fps.js`, 5 083 triangles, la vraie tenue) si Haythem préfère ses manches ;
  il garde le même IK.

### 6.4 Poses et animations de la 1re personne (lues dans l'état de l'arme, jamais l'inverse)

Repère caméra, mètres et radians (rx tangage, ry lacet, rz roulis) :

| Pose | Position | Rotation | Remarques |
|---|---|---|---|
| Hanche | (0,135 ; −0,125 ; −0,32) | (0 ; 0,035 ; 0) | |
| Visée | (0 ; −visee.y ; −0,24 − visee.z) | (0 ; 0 ; 0) | l'œilleton sur l'axe de la caméra ; champ de l'arme 52° → 44° |
| Sprint | (0,06 ; −0,19 ; −0,25) | (−0,55 ; 0,65 ; 0,35) | canon vers le bas et la gauche ; balancement ×2,5 |
| Sprint tactique | (0,10 ; −0,10 ; −0,30) | (0,9 ; 0,2 ; −0,4) | arme levée contre l'épaule |
| Glissade | hanche + (−0,02 ; −0,03 ; 0) | roulis −0,25 | |
| Franchissement | (0,12 ; −0,22 ; −0,22) | (−0,3 ; 0,4 ; 0,45) | main gauche lâche et « pousse » vers le bas |

Ressorts superposés (tous ω/ζ) : **inertie du regard** (l'arme traîne derrière la rotation : décalage = −0,0016 ×
vitesse angulaire, ±3°, ω 18, ζ 0,8) ; **balancement** en huit (latéral 12 mm à f/2, vertical 8 mm à f ; sprint ×2,5 ;
visée ×0,1) ; **inclinaison de pas chassé** 3° ; **réception** −2,5 cm ; **recul** (§ 5.5) ; **respiration** à l'arrêt
(±1,5 mm à 0,25 Hz).

Chronologies (pistes à clés, interpolation de Hermite ; « son » = événement sonore) :
- **FA-24, rechargement tactique (1,90 s)** : 0,00-0,25 arme roulée de 25° et cabrée de 15° · 0,25-0,50 main gauche au
  chargeur (prise `chargeur`) · 0,50 son « clic » · 0,55 le chargeur part avec la main (os `chargeur` suit la main) ·
  0,55-0,95 main gauche hors champ en bas à gauche (ceinture) · 0,95-1,25 chargeur neuf qui remonte · **1,35 son
  « clac », les balles entrent** · 1,35-1,60 tape sous le chargeur, main au garde-main · 1,60-1,90 retour à la hanche.
  **À vide (2,45 s)** : le même, puis 1,90-2,25 main gauche sur l'arrêtoir de culasse (son « tchak » à 2,05), retour.
  Le chargeur vide d'un rechargement à vide tombe dans le MONDE (une douille géante : même système, § 7.3).
- **FP-12** : chaque cartouche 0,42 s (main gauche sous l'arme, pouce qui pousse, son à 0,30), pompe à vide en fin.
- **TP-50, tir** : 0,25 s après le coup, culasse (levier 60° en 0,15 s, recul 8 cm en 0,12 s, éjection, retour) — le
  verrou est la cadence de 1,33 s ; en visée, la lunette reste devant l'œil pendant le réarmement.
- **Changement d'arme** : rangement = arme qui descend de 0,25 m et tourne de 0,6 rad (temps de la fiche) ; sortie
  inverse avec un petit dépassement (ressort ω 20, ζ 0,6) ; son de tissu + « clic ».
- **Couteau** : arme qui part en bas à droite 0,10 s, couteau dans la main droite qui fauche de droite à gauche en
  0,18 s (touche à 0,12), retour 0,32 s.
- **Grenade** : arme baissée 0,15 s, main gauche tire l'anneau (son), main droite tenue en arrière tant qu'on cuisine,
  lancer 0,35 s, arme qui remonte 0,25 s.
- **Inspection** (tenir R 0,6 s, arme pleine) : 2,5 s de rotation de l'arme — gratuit, très « CoD ».

### 6.5 L'éclairage de l'arme de vue

Scène de l'arme à elle : `sceneArme.environment = scene.environment` (la carte d'environnement de la pièce de Haythem,
reprise à chaque entrée de pièce), une `HemisphereLight` et une `DirectionalLight` « clé » au-dessus et à droite, plus
une `PointLight` à la bouche (intensité 0 hors éclair) — **le nombre de lumières de `sceneArme` ne change jamais** (sa
compilation est faite sous l'écran de chargement par `game._compilerAsync(sceneArme)`, `game.js:309`). Intensité de la
clé = valeur par zone (table `CLE_ZONE` sur les 47 zones, défaut 1,0, −1 et couloirs sombres 0,55) lissée 0,4 s : l'arme
ne brille pas dans un couloir noir quand l'œil automatique éclaircit tout.

### 6.6 Où on la dessine

- Composer : `fx.composer.insertPass(passeArme, 3)` — **après `oeil`** (`js/fx.js:618`), avant le bloom : l'arme reçoit le
  bloom, la sortie et l'étalonnage comme le décor, mais elle ne fausse pas l'exposition automatique (l'arme noire qui
  occupe 15 % de l'écran ferait éclaircir la scène en visée) ni l'occlusion. `passeArme` = rendu de `sceneArme` par
  `camArme` (champ 52° vertical, near 0,01, far 5) dans le tampon de lecture, `clear = false`, profondeur effacée.
- Basse (`fx.enabled === false`, `js/fx.js:2062`) : `renderer.render(scene, camera)` puis `autoClear = false ;
  clearDepth() ; render(sceneArme, camArme) ; autoClear = true`.
- La lunette du TP-50 en visée : viewmodel caché, masque HTML (§ 4.3).

---------------------------------------------------------------------------------------------------------------------

## 7. LES RETOURS (FEEDBACK)

### 7.1 Le budget (au-dessus du décor ; `carte_props` § 4.4)

| Effet | Technique | PC | Téléphone | Appels |
|---|---|---|---|---|
| Impacts (trous, fêlures) | quads alignés, `InstancedMesh` en anneau, `polygonOffset -4` | 256 | 96 | 1 |
| Étincelles + poussière | `InstancedMesh` de quads additifs / doux, vie 0,25-0,6 s | 96 | 32 | 2 |
| Traceurs | quads étirés additifs, `toneMapped: false` (bloom) | 32 | 16 | 1 |
| Douilles + chargeurs tombés | `InstancedMesh` cylindre 8 côtés, `castShadow false` | 64 | 24 | 2 |
| Éclairs de bouche (monde, bots) | 2 quads croisés + étoile, additifs | 16 | 8 | 1 |
| Lumière d'éclair / explosion | 1 `PointLight` préallouée (intensité seule) | 1 | 0 | 0 (par pixel) |
| Viewmodel | § 6 | 6 | 6 | 6 |
| Bots (avatars) | `Player` | 7 × 12 | 3 × 12 | 84 / 36 |

Tout est à la RACINE de la scène avec `userData.dynamique = true` (`carte_props` piège 1), créé et compilé sous l'écran
de chargement (`Player.preparerRendu`, `game._compilerTout(o, true)`) — sinon une image figée au premier tir.

### 7.2 L'éclair de bouche

3 images (≈ 50 ms) : quads additifs à la `bouche`, taille 0,10-0,16 m tirée au hasard, rotation aléatoire ; dans
`sceneArme` pour Haythem (avec sa `PointLight` de bouche : l'arme s'éclaire elle-même), dans le monde pour les bots.
La `PointLight` préallouée du monde (4,5 m) prend l'éclair le plus important de l'image : explosion > tir de Haythem >
bot le plus proche ; intensité 6 → 0 en 60 ms (explosion 40 → 0 en 0,25 s). **Jamais une lumière ajoutée en jeu**
(27 s figées, `carte_props` § 5.4).

### 7.3 Traceurs, impacts, douilles

- Traceurs : une balle sur trois pour les armes automatiques, toutes pour les bots (on voit d'où ça tire) ; un trait de
  2,5 m qui file à 400 m/s de la bouche au point d'impact (un tir à 20 m se voit 50 ms).
- Impacts : décalque seulement sur les formes hautes (`y1 − y0 > 1,8`) et les plafonds — ailleurs (meubles aux formes
  grossières, `carte_props` § 5.2) une gerbe sans décalque ; vitre = fêlure étoilée + son de verre ; sol = poussière ;
  pas sur les vantaux (ils bougent). Effacement par rétrécissement après 25 s ou par l'anneau.
- Douilles : éjectées du monde au point « œil + 0,12 droite − 0,08 bas + 0,35 avant », vitesse (1,8 droite, 1,2 haut,
  ±0,3), rotation ; sol par `solEn`, deux rebonds (restitution 0,3), son « tink » (sinus 4,2 kHz 40 ms + bruit) au premier
  rebond ; vie 3 s.

### 7.4 Toucher, être touché

| Retour | Valeurs |
|---|---|
| Marqueur de touche | X blanc de 4 traits (2 × 10 px, à 6 px du centre), 0,12 s ; son « tic » (triangle 1,8 kHz, 30 ms) |
| Tête | X un peu plus grand, son « ding » (sinus 3,2 kHz 120 ms + harmonique) |
| Élimination | X rouge `#ff3b30`, 0,22 s, ×1,15 ; son sourd + 2e tic ; « +100 ÉLIMINATION » à droite du réticule |
| Corps touché (vu) | sursaut du bot (buste −0,15 rad à l'opposé du coup, ressort ω 18) ; sa vitesse ×0,7 pendant 0,3 s |
| Être touché | indicateur rouge en arc de 30° à 120 px du centre vers le tireur (opacité ∝ dégâts, 1,6 s) ; « punch » de visée 1,2° × dégâts/30 qui revient en 0,18 s ; son mat (« thwack ») ; vibration manette (fort 0,5, faible 0,8, 90 ms) |
| Vie basse | vignette rouge HTML (`#hud-vignette`, dégradé radial) d'opacité `(1 − vie/60) × 0,85` sous 60 PV, qui bat à 1,2 Hz sous 30 PV avec un cœur (deux sinus 55 Hz, 75 battements/min) |
| Régénération | 4,0 s après le dernier dégât, +35 PV/s (0 → 100 en 2,9 s) ; atout Récupération : 2,5 s |
| Grenade près de soi | icône de grenade orientée à ≤ 7 m |
| Explosion proche | secousse 0,06 → 0 en 0,5 s (∝ 1 − d/8), acouphène (sinus 3,6 kHz 1,5 s) + passe-bas 600 Hz sur la sortie qui se rouvre en 2 s |

### 7.5 Le son (`son_combat.js`) : synthétisé, spatialisé, occulté

- Une **voix** = source → `BiquadFilter` (occlusion) → `PannerNode` (`equalpower`, modèle `inverse`, référence 2 m,
  atténuation 1,2, max 60 m) → sortie + envoi vers la réverbération existante (`audio.js:35-49`). **24 voix au plus**,
  les plus faibles volées. Auditeur : position ET orientation de la caméra à chaque image (`audio.setListener` ne passe
  aujourd'hui que la position, `game.js:449`).
- **Occlusion** (10 Hz par voix active) : `rayonLibre` auditeur → source bloqué → −9 dB et passe-bas 700 Hz ; autre
  niveau → −14 dB, passe-bas 400 Hz. **Retard du son** : `d / 343` s (un tir à 50 m s'entend 0,15 s après son éclair).
- Bruit blanc précalculé une fois (1 s, départ au hasard) : `audio._noise` alloue aujourd'hui un tampon par appel
  (`audio.js:73`), intenable à 12 coups/s × 8 tireurs.
- Recettes de tir (claquement / corps / grave / mécanique / queue) :

| Arme | Claquement (passe-haut) | Corps | Grave (sinus) | Mécanique | Queue |
|---|---|---|---|---|---|
| FA-24 | 2,5 kHz, 6 ms | passe-bande 1,1 kHz, 90 ms | 95 → 45 Hz, 110 ms | clic 3,2 kHz 12 ms | réverbération + écho à 45 ms (−12 dB) dedans |
| PM-9 | 3 kHz, 5 ms | 1,5 kHz, 70 ms | 120 → 60 Hz, 80 ms | clic léger | idem, plus court |
| FP-12 | 2 kHz, 10 ms | passe-bas 900 Hz, 220 ms | 70 → 35 Hz, 260 ms | « tchk-tchk » de pompe à +0,35 s | longue |
| TP-50 | 3,5 kHz, 8 ms | 800 Hz, 180 ms | 60 → 30 Hz, 220 ms | culasse à +0,25 s | 1,2 s de bruit passe-bas qui s'éteint (le couloir) |
| P-17 | 3,5 kHz, 4 ms | 1,8 kHz, 60 ms | 140 → 70 Hz, 70 ms | glissière | courte |
| Silencieux | — | passe-bande 600 Hz « pfft » | ×0,5 | clic | sans |

  Au-delà de 25 m : plus de claquement, corps passe-bas 1,2 kHz. Hauteur ±4 % par coup (graine de la partie).
- Pas des autres : spatialisés et AMPLIFIÉS (+4 dB sur les ennemis : en CoD on les entend), sprint 14 m, course 9 m,
  marche 4 m, accroupi muet ; les couches les jouent (`couches.js:124, 328`, avec `p.audible`).
- Divers : rechargements (clic, chargeur qui glisse — bruit passe-bande 3 kHz —, « clac »), tir à vide (clic sec),
  sifflement d'une balle qui passe à < 1,5 m (bruit passe-bande 4 kHz balayé, 80 ms), changement d'arme, sifflet et
  sirène de début/fin (`buzzer`, `whistle` de LA CAGE `js/audio.js` l. 178, 234).

### 7.6 La mort et la killcam

- **Caméra de mort** (lot 5) : roulis 25° et chute de l'œil à 0,4 m en 0,8 s, image désaturée (filtre CSS sur le canvas
  3 s), son étouffé ; carte « ÉLIMINÉ PAR GABRIEL — FA-24 · tête · 18 m · il lui reste 42 PV » ; la caméra se tourne
  vers le tueur (s'il est en vue) ; réapparition après 3,0 s (CPS 2,0 s), Espace / A pour passer.
- **Killcam rejouée** (lot 8) : un anneau d'**images** à 30 Hz sur 6 s de tous les acteurs (`Float32Array` : position,
  cap, tangage, vitesse, accroupi, arme, état d'arme ≈ 20 nombres × 12 acteurs × 180 images ≈ 170 Ko) + les événements de
  tir. Rejeu : simulation gelée, chaque `Player` reposé depuis l'anneau (pos, vitesse → `_driveAnim` choisit les clips),
  caméra dans l'œil du tueur avec son arme de vue, traceurs et éclairs rejoués ; 4,5 s finissant 1 s après la mort ; à
  la dernière élimination de la partie, « KILLCAM FINALE » avec 0,4 s au ralenti (×0,25). Ensuite `partie.appliquer(
  photo)` remet tout comme avant le rejeu (d'où l'état sérialisable). `jeuCarte` (§ 2.2) fait suivre le niveau rendu.
- **Mort d'un bot** : poupée de chiffon Verlet (`banc/ragdoll.js`, 0,037 ms/pas) avec les murs (`collisions.resoudre`
  sur Hips/Spine2/Head) et l'impulsion de la balle (2,5 m/s ; tête : coup sec), 4 s au sol puis s'enfonce de 0,5 m en
  0,4 s et disparaît ; réapparition = le même `Player` remis (`anim.couper()` PUIS `animKey = null`, `carte_persos`
  piège 2). **Pas de sang**, pas de corps qui restent (choix assumé, et c'est moins cher).

### 7.7 Médailles et annonces (`hud.feedback`, qui fait déjà vibrer la manette)

PREMIER SANG · TIR À LA TÊTE · DOUBLÉ (2 en 4 s) · TRIPLÉ · FURIE (4) · VENGEANCE (tuer son tueur) · SAUVETAGE (tuer
qui vient de toucher un allié) · LONGUE DISTANCE (> 30 m) · À BOUT PORTANT (< 2 m) · AU COUTEAU · SÉRIE DE 5 / 10 ·
CAPTURE / NEUTRALISATION / DÉFENSE (Domination) — chacune +25 à +100 XP et une ligne « +XP » empilée.

---------------------------------------------------------------------------------------------------------------------

## 8. LES BOTS (`bots.js`, `nav.js`)

### 8.1 Corps et budget

- Un bot = `new Player(fiche, scene)` + un `Combattant`. Fiches : avatars des amis en **`assets/tel/<nom>.glb` même sur
  PC** (47-79 Mo de mémoire graphique par avatar distinct en PC, 19-27 Mo en `tel/`) : première fournée gabriel, imad,
  marcantoine (gabarit A, celui de Haythem), koji, djafar (B), ethan (C) — `carte_persos` § 4.6. Téléphone : 3 bots.
- Équipe lisible : bandeau et brassard de couleur (primitives enfants des os, `poserCoiffure` de LA CAGE
  `js/headwear.js` l. 114) ; plaques de noms (bleu pour les alliés toujours, rouge pour un ennemi seulement visé à ≤ 30 m) ;
  au téléphone, les « passants » recolorés par `materiauPassant` (LA CAGE `js/pedestrians.js` l. 217).
- `p.sansRangs = true`, `p.poseParImage = true`, `p.audible = true`, `p.cibleRegard = null` arme levée ;
  visibilité à la main (`zoneDe` + `zonesCachees`, `carte_props` § 6), ombre seulement au niveau du joueur ; pose à
  4 Hz hors de vue.
- Coûts visés (7 bots, PC) : simulation + pose ≈ 1,2 ms par image, IA ≈ 0,3 ms, rendu +84 appels.

### 8.2 Navigation

- Graphe de `carte_monde` § 7 (grille 0,25 m, représentant poussé + balayage `C.deplacer`), bornes de jeu
  `{ xMin: −3, xMax: 23, zMin: −24.5, zMax: 6 }` (8 956 nœuds), portes automatiques ouvertes pendant la génération,
  cabine d'ascenseur exclue ; chaque nœud reçoit sa zone (`lumieres.zoneEn`), son niveau et son **dégagement** (pour les
  couverts). Généré sous l'écran de chargement (0,7 s sur PC), gardé en IndexedDB (clé = empreinte du monde solide).
- Chemins : A* (2,7 ms en moyenne, distances en `Float64Array`), **une recherche au plus par image** pour tous les bots
  (file), ficelle tirée par balayage tous les 0,25 s (100/100 arrivées mesurées) ; coincé (< 0,6 m en 2 s) → lien
  pénalisé et nouveau chemin ; écartement entre corps (r 0,3 + 0,3, poussée partagée).
- Monde en partie : portes automatiques **ouvertes à demeure** (`P.force = true` : 100/100 au lieu de 64/100),
  ascenseur hors service, rangs serrés laissés à Haythem (couverts de l'amphi).

### 8.3 Perception (jamais à travers un mur)

| Sens | Règle | Coût |
|---|---|---|
| Vue | ennemi à ≤ 50 m, dans le cône (demi-angle 50° / 60° / 65° / 70° selon la difficulté) ou à ≤ 2,5 m ; **ligne de vue** œil → tête ou buste : pré-filtre `zonesCachees & zoneDe` (2 µs, jamais faux) puis DDA (8 µs), vitres transparentes | 10 Hz par bot, étalé |
| Repérage | jauge 0 → 1 : `vitesse = 1/tReaction × f(d) × (cible accroupie immobile ? 0,6 : 1) × (cible qui tire ? 2 : 1)`, `f` = 1 à ≤ 10 m, 0,5 à 30 m, 0,3 à 50 m ; à 1, la cible est connue exactement tant qu'elle reste vue | — |
| Ouïe | tirs : rayon de l'arme (45 m, 25 m à un autre niveau, silencieux 8 m) ; pas : sprint 14, course 9, marche 4, accroupi 0 (Pas feutrés ÷3) ; explosion 60 m ; balle passée à < 1,5 m → direction | événements de la partie |
| Douleur | touché → direction exacte du tireur, sa position à ±2 m s'il est à ≤ 25 m | — |
| Équipe | ce qu'un bot repère est partagé 0,6 s plus tard (« annonce »), oublié après 6 s | — |

Chaque indice de l'ouïe est faux de ±1,5 à ±4 m (bruit de la graine) : les bots vont VOIR, ils ne savent pas.

### 8.4 Décision et combat

États : `PATROUILLE → ALERTE (indice) → TRAQUE (dernière position connue) → COMBAT (cible vue) → REPLI (couvert) →
OBJECTIF (Domination)`, pensée à 20 Hz, priorité : COMBAT si une cible repérée est vue ; REPLI si vie < 35 % et touché
il y a < 3 s (probabilité par difficulté) ; TRAQUE si un contact a < 6 s ; OBJECTIF selon le mode ; sinon PATROUILLE
vers les **points chauds** (chaque zone garde une chaleur des tirs et morts récents, demi-vie 30 s) — c'est ce qui
remet l'action là où elle est, comme sur une carte de CoD.

| Paramètre | Recrue | Régulier | Aguerri | Vétéran |
|---|---|---|---|---|
| Temps de réaction (repéré → 1er tir) | 0,65 s | 0,45 | 0,30 | 0,20 |
| Erreur de visée au départ σ0 → finale σ∞ (à 10 m, cible immobile) | 9° → 2,8° | 7° → 1,9° | 5° → 1,2° | 3,5° → 0,7° |
| Resserrage τ | 0,9 s | 0,7 | 0,5 | 0,35 |
| Probabilité de viser la tête | 10 % | 20 % | 35 % | 50 % |
| Vitesse de rotation | 220°/s | 300 | 380 | 450 |
| Compensation du recul | 40 % | 65 % | 85 % | 95 % |
| Rafales (FA-24) / pause | 3-5 / 0,6 s | 4-7 / 0,45 | 5-9 / 0,30 | 6-12 / 0,22 |
| Repli sous 35 % | 30 % | 50 % | 70 % | 85 % |
| Grenades, coup d'œil depuis un couvert, couteau | non | grenades | oui | oui (+ pré-visée des portes) |

- Erreur appliquée : point visé = buste (ou tête) + erreur angulaire 2D gaussienne `σ(t) = σ∞ + (σ0 − σ∞)·e^(−t/τ)`,
  ×1,5 si la cible se déplace latéralement à > 2 m/s, ×1,3 si le bot bouge, ×1,8 pendant 0,3 s après une touche reçue,
  ×(1 + 0,02 (d − 20)) au-delà de 20 m. Le bot tire de VRAIES balles (`balle()`) : ses touches viennent de la géométrie.
  Ordre de grandeur (buste de 0,4 × 0,5 m à 10 m, FA-24 à 12,5 coups/s) : 12 % / 25 % / 50 % / 85 % de touches →
  Haythem meurt en 2,7 s / 1,3 s / 0,7 s / 0,4 s de tir continu. Il a donc, en Régulier, une seconde pour répondre.
- Mouvement en combat : pas chassés en visée, changement de sens toutes les 0,5-1,2 s, accroupi 15/25/35/40 % à plus de
  15 m ; PM-9 et FP-12 foncent sous 8 m ; jamais de saut tireur.
- Tir seulement avec la ligne de vue ; perdue → 0,15 s de tir encore (Aguerri et Vétéran : 0,3 s de « suppression » sur
  la dernière position vue), puis TRAQUE, arrivée lente avec pré-visée de la porte (Vétéran).
- Recharge à < 25 % sans cible ; vide sous le feu → pistolet (Aguerri+) ou repli. Couvert : 12 nœuds tirés dans un anneau
  de 2-8 m, gardés s'ils sont cachés de la menace à 1,0 m (accroupi) et vus à 1,6 m (on peut sortir la tête) : 0,2 ms par
  décision, 2 décisions par seconde au plus.
- Grenades (Régulier+) : ennemi connu immobile ≥ 3 s derrière un couvert, à 8-25 m, sans ligne de vue → frag (tir
  balistique sans rebond prévu), 25 s entre deux par bot, 10 s par équipe.
- Choix de la cible : hystérésis (on garde la sienne sauf menace 40 % plus proche ou qui tire sur soi).
- Difficulté « Mixte » : alliés Régulier, ennemis tirés entre Recrue et Aguerri.

---------------------------------------------------------------------------------------------------------------------

## 9. HUD (`hud_combat.js`, HTML sous `#hud`, `pointer-events: none`)

Règle d'IRIS : le DOM n'est touché que quand une valeur affichée change (`ui.js:293-296`) ; le réticule et la
mini-carte sont les seuls à bouger à chaque image (transformations CSS / un canevas 2D).

### 9.1 Disposition (PC ; au tactile, les variables `--tc-*` de `touch.js:181-197`)

| Bloc | Place | Contenu |
|---|---|---|
| `#hud-viseur` | centre | 4 traits 2 × 9 px, écart `4 px + dispersion` (§ 5.4), blanc 90 % avec contour noir 1 px ; bleu sur un allié, rouge sur un ennemi visé ; caché en visée (point rouge et crans sont dans le modèle) ; point central en option ; couleur réglable |
| `#hud-touche` | centre | marqueurs (§ 7.4) |
| `#hud-xp` | à droite du réticule | « +100 ÉLIMINATION », « +25 TÊTE » empilés, 1,5 s |
| `#hud-score` | haut gauche | équipe SISR (bleu) et SLAM (orange), barres vers la limite, chrono (`.clock` de `css/style.css:140`, rouge sous 30 s) |
| `#hud-domination` | haut centre | A B C, couleur du possesseur, anneau de capture |
| `#hud-fil` | haut droite | 5 lignes, 5 s : « Haythem [silhouette FA-24] Gabriel » + icône tête ; silhouettes d'armes en SVG en ligne dessinés à la main |
| `#hud-carte` | bas gauche | mini-carte 200 px (160 au tactile) qui tourne avec Haythem, 24 m de large ; fond = **silhouette du niveau courant rastérisée depuis les nœuds du graphe** (une case de 0,25 m = 2 px, un canevas par niveau fait au chargement) ; alliés (flèches bleues), ennemis = points rouges 2 s après chaque tir non silencieux ou sous drone, drapeaux, chevrons ↑↓ pour qui est à un autre niveau ; nom du niveau (« −1 · ESPACE PAUSE ») |
| `#hud-vie` | au-dessus de la mini-carte | barre fine 100 PV (+ armure), qui ne se montre qu'abîmée |
| `#hud-munitions` | bas droite | « 24 » gros / « 90 » ; nom de l'arme ; grenades (icônes) ; « R RECHARGER » sous 30 %, « PLUS DE MUNITIONS » en rouge |
| `#hud-serie` | au-dessus des munitions | 3 icônes de séries, progression de la série en cours |
| `#hud-degats`, `#hud-vignette`, `#hud-lunette` | plein écran | § 7.4, § 4.3 |
| `#hud-annonce` | centre haut | réutilise `#hud-feedback` (médailles, « DOMINATION A PRISE ») |

`body.combat` cache `.stamina`, `#hud-keys`, `#phone-badge` (index.html:210-213).

### 9.2 Écrans

- **Tableau des scores** (`#tableau`, Tab / Back maintenu, hors `RACINES` pour que la manette ne passe pas en contexte
  menu) : rang, portrait 32 px (`portrait(def)` de LA CAGE `js/portraits.js` l. 106), nom, score, É, M, A, ratio, série
  en cours ; deux colonnes d'équipe.
- **Carte de mort** (`#mort`) : § 7.6.
- **Fin de partie** (`#fin-partie`, dans `RACINES`) : « VICTOIRE » / « DÉFAITE » / « ÉGALITÉ » plein écran 2,5 s (sirène),
  puis le bilan : podium des 3 meilleurs (portraits), médailles, XP gagnée qui remplit la barre de niveau, déblocages ;
  REJOUER (mêmes réglages) · CHANGER DE MODE · MENU PRINCIPAL. Pas l'`#overlay` détourné (son B « tape » la pause,
  `manette_menus.js:344`).

---------------------------------------------------------------------------------------------------------------------

## 10. MODES, MANCHES, APPARITIONS

### 10.1 Les modes

| Mode | Joueurs (PC / tél.) | Limite / temps | Réapparition | Particularités |
|---|---|---|---|---|
| **Match à mort par équipes** (SISR contre SLAM) | 4 c. 4 (3 c. 3, 5 c. 5 en haute) / 2 c. 2 | 40 éliminations (30 / 50) · 10 min | 3,0 s | score d'équipe +1 par élimination |
| **Chacun pour soi** | Haythem + 5 bots / + 3 | 20 éliminations · 10 min | 2,0 s | les 3 premiers gagnent (podium) |
| **Domination** | 4 c. 4 / 2 c. 2 | 150 points · 10 min ; mi-temps à 75 points ou 5 min (les camps s'échangent : l'école n'est pas symétrique) | 3,0 s | **A = hall (14,88 ; 0 ; −3,12), B = espace pause du −1 (9,38 ; −3,06 ; −9,37), C = espace pause du 1er (12,63 ; 3,5 ; −7,87)**, rayon 2,5 / 3 / 3 m ; capture 8 s d'un point neutre (×1,5 à deux, ×2 à trois), 12 s d'un point adverse (neutralisé à 4 s) ; +1 point par point tenu toutes les 3 s |
| **Stand de tir** | Haythem seul | défis chronométrés | — | dans la rue bornée : silhouettes en carton (boîtes) qui se lèvent à 8 / 15 / 25 / 40 m, « 20 cibles en 30 s », records `iris.stand.v1` (le motif de LA CAGE `js/training.js`) ; mannequin fixe qui affiche zones et dégâts : le banc de réglage du ressenti (lot 2) |

Plus tard (lot 9, idées) : **Élimination confirmée** (le tué lâche sa « carte d'étudiant » qu'il faut ramasser),
Recherche et destruction (manches sans réapparition), Gun game.

Équilibre de la Domination (distances à pied, `carte_monde` § 8) : SISR (rue) → A 13 m, B 35, C 33 ; SLAM (2e) → A 28,
B 37, C 17. Chaque camp a son point « maison » (13 / 17 m), le −1 au milieu (35 / 37 m), et la mi-temps rétablit le reste.

### 10.2 Zones de jeu (choix du menu)

| Zone | Contenu | Fermée par une rubalise aux passages (`carte_monde` § 7, liste des 46) | Apparitions |
|---|---|---|---|
| Toute l'école | 4 niveaux + rue bornée (z ≤ 6, x −3…23) | rue au-delà des bornes | SISR rue/porche · SLAM 2e |
| RDC + rue | hall, attente, hall ouest, passage, salle David Clark, couloir est, C01, rue | `hallO|palierSS`, `couloirEst|descenteEst`, `escalier|hallO`, `escEst|vestEst` | rue contre salle David Clark |
| Le −1 seul (petit, nerveux) | pause, grande salle S −1.14, hall, couloir, sas | `hallO|palierSS`, `couloirEst|descenteEst` | pause côté ouest contre sas est |
| Les étages | 1er + 2e | `escalier|hallO`, `escEst|vestEst` | S 1.3 contre salles du 2e |

Rubalise = une boîte du monde solide `ajouterBoite(…, { y0: sol, y1: sol + 2.5 })` (joueur, caméra, balle) posée au
début de la partie, `off = true` à la fin (on ne retire pas une forme, `carte_monde` § 1.4) + deux rubans rayés rouge
et blanc et un panneau « ZONE FERMÉE » (2 appels). Le graphe n'est pas regénéré : on filtre ses nœuds par zone.

### 10.3 Les apparitions

- Points : les 20 du tableau de `carte_monde` § 8, complétés par échantillonnage du graphe (nœuds de dégagement
  ≥ 0,75 m, hors volées, au plus loin les uns des autres) → ≈ 12 par niveau ; une table de distances à pied par point
  (Dijkstra 15 ms chacun, sous l'écran de chargement).
- Début de partie : chaque camp à ses points fixes (§ 10.1/10.2), un par joueur, 1,5 m d'écart.
- Ensuite (logique de CoD) : `note(p) = 1,0 × proximité des alliés (≤ 15 m à pied) − 3,0 × danger` avec danger = ennemis
  à ≤ 20 m à pied (×3 s'ils ont une ligne de vue sur le point) + morts récentes à ≤ 8 m ; on tire parmi les 3 meilleurs
  (graine). CPS : le point qui maximise la distance au plus proche ennemi et n'est vu par personne.
- Protection : 1,2 s d'invulnérabilité (finie au premier tir). Jamais deux camps visibles l'un de l'autre au départ : le
  RDC est un seul plateau ouvert (hall–attente–hall ouest se voient).

### 10.4 La machine d'états de la partie

`chargement → presentation (3 s : nom du mode et de la zone, caméra qui survole) → decompte (3, 2, 1, buzzer) →
manche (combat = vrai) → [mi-temps (5 s, camps échangés)] → fin (killcam finale, bilan)`. `stateT` en secondes, tout
dans `update` (la pause gèle tout, `carte_coeur` § 5.5). Les séries, les zones et le chrono sont dans l'état.

---------------------------------------------------------------------------------------------------------------------

## 11. PROGRESSION LÉGÈRE (`profil.js`, `iris.profil.v1`)

| XP | Valeur |
|---|---|
| Élimination | 100 (+25 tête, +25 couteau, +50 au-delà de 30 m) |
| Assistance (≥ 30 dégâts sur une cible tuée dans les 5 s) | 25 |
| Capture / neutralisation / défense | 150 / 75 / 50 |
| Série (3, 5, 7…) | 50 × longueur |
| Victoire / fin de partie | 400 / 200 |
| Médailles | 25-100 |

- **Niveaux 1-40** : passer de n à n+1 coûte `800 + 200 (n − 1)` XP (niveau 10 à 14 400, 40 à 179 400) ; une partie de
  10 min en Régulier ≈ 2 500-3 500 XP → niveau 10 en ~5 parties, 40 en ~60.
- **Déblocages** : 1 FA-24, P-17, frag, flash, classe Assaut · 2 PM-9, Infiltration · 4 FP-12, Défense · 6 classes
  personnalisées (5 emplacements) · 8 TP-50, Tireur · 10 point rouge · 12 poignée · 14 chargeur étendu · 16 silencieux ·
  18-26 atouts · 30+ camouflages (et « Or » d'une arme après 100 éliminations à la tête avec elle).
- **Accessoires** (un par arme au plus, simple) : point rouge (zoom ×1,30, visée plus nette), poignée (recul ×0,8, ADS
  +0,02 s), chargeur étendu (+50 %, ADS +0,04 s, rechargement +0,2 s), silencieux (bruit 45 → 8 m, pas de point rouge
  sur la mini-carte, paliers de distance −15 %). Modélisés : quelques pièces de plus sur les os de l'arme.
- **Classes de départ** : Assaut (FA-24 + P-17 + frag + flash + Endurance) · Infiltration (PM-9 silencieux + P-17 + frag
  + flash + Pas feutrés) · Défense (FP-12 + P-17 + frag + 2 flash + Main sûre) · Tireur (TP-50 + P-17 + flash + Récupération).
- **Atouts** (un) : Endurance (sprint tactique ×2, recharge ×0,5) · Main sûre (rechargement ×0,75, changement ×0,8) ·
  Pas feutrés (pas ÷3 pour les bots) · Récupération (régénération à 2,5 s) · Fantôme (invisible au drone). Mécanique de
  coefficients = `badgeFx(map)` de LA CAGE (`js/badges.js` l. 91).
- **Séries** (par vie, éliminations ; croix ← ↑ → / 3 4 5) : **3 Drone de surveillance** (25 s : ennemis sur la
  mini-carte toutes les 2 s, sauf Fantôme) · **5 Gilet** (+60 d'armure, prise avant la vie) · **7 Sentinelle** (tourelle
  modélisée à la main — trépied, boîte, canon — posée devant soi, 40 s ou 300 PV, tir comme un bot Régulier à ≤ 25 m sur
  180°). Les bots ont le drone (il alimente leur mémoire d'équipe toutes les 3 s : pas de triche, c'est leur radar).
- **Défis** (affichés au profil) : 3 par jour tirés à la date (graine), ex. « 10 éliminations au PM-9 », « 3 captures ».
- Statistiques : éliminations, morts, ratio, précision, tête, par arme et par mode ; tout en `try/catch` (navigation
  privée) — le jeu tourne sans.

---------------------------------------------------------------------------------------------------------------------

## 12. MENUS (`menu.js`, `#menu` en `.screen`, dans `RACINES`)

- **Menu principal** (après « APPUIE POUR COMMENCER », `main.js:84`) : fond 3D vivant (la caméra glisse lentement entre
  trois plans : le hall, l'escalier principal, la pause du 1er ; `game.mode = 'menu'` : ni tactile ni commandes, HUD
  caché donc `fx._enJeu()` faux et la qualité ne se mesure pas), titre IRIS, niveau et barre d'XP de Haythem, boutons :
  **BALADE LIBRE** (l'`enterLobby()` d'aujourd'hui, rien ne change) · **COMBAT (FPS) CONTRE LES BOTS** · **PROP HUNT** ·
  ARMURERIE · PROFIL · OPTIONS · CRÉDITS (Avaturn, Mixamo, CMU, Sketchfab CC BY 4.0 : exigé par les danses,
  `carte_cage` § 4).
- **Réglages de partie** : Mode (MME / CPS / Domination / Stand de tir) · Zone (§ 10.2) · Alliés 0-4 et ennemis 1-5
  (total ≤ 7 bots sur PC, 3 au téléphone ; grisé au-delà) · Difficulté (Recrue / Régulier / Aguerri / Vétéran / Mixte) ·
  Limite et temps (préréglés par mode, modifiables) · Classe de départ · LANCER. Derniers choix gardés
  (`iris.partie.v1`).
- **Armurerie** : classes (principale, accessoire, secondaire, létale, tactique, atout), arme en 3D qui tourne (le
  modèle de vue rendu dans `sceneArme` sur le fond du menu), camouflages, chiffres (barres dégâts, cadence, portée,
  maniabilité, mobilité).
- **Pause en partie** : Reprendre · Tableau des scores · Options (onglet COMBAT : champ, sensibilité FPS et en visée,
  visée maintenue/bascule, accroupi, sprint auto, aide à la visée, couleur du réticule, secousses, tir auto tactile) ·
  Commandes (sous-onglets BALADE / COMBAT) · Quitter la partie (retour au menu).
- Chargement : sous-titre « L'ÉCOLE · BALADE ET COMBAT » (`index.html:128`), astuces de combat (`chargement.js:465-476`),
  armes, sons et graphe préparés dans l'étape « joueurs » (`demarrage.js`).

---------------------------------------------------------------------------------------------------------------------

## 13. COMMANDES — PROFIL « COMBAT »

Un code partagé est consommé par la première action qui le lit (`input.js:69-75`) : la balade et le combat ont chacun
leur table (`bindings` / `bindingsFps`), échangées par `input.setBindings` à l'entrée et à la sortie de partie.

| Action | Clavier/souris (e.code ; touche AZERTY) | Manette | Tactile |
|---|---|---|---|
| Avancer / reculer / gauche / droite | KeyW KeyS KeyA KeyD (Z S Q D) | stick G | joystick |
| Sprint (double = tactique) | ShiftLeft (Maj G) | L3 (double) | joystick au-delà du bord |
| Marcher | AltLeft | stick à moins de 58 % | effleurer |
| Saut / franchir | Space | A | SAUT |
| Accroupi / glissade | KeyC, ControlLeft (C, Ctrl G) | B | ACCROUPI |
| Tirer | Souris:0 (clic G) | RT | TIR (mixte regard) |
| Viser (maintenir ; bascule en option) / retenir son souffle = Maj en visée | Souris:2 (clic D) | LT | VISER |
| Recharger | KeyR (R) | X (appui) | RECHARGER |
| Interagir / ramasser (maintenir 0,35 s) | KeyF (F) | X (maintenu) | bouton contextuel |
| Arme suivante / précédente | Molette:haut / Molette:bas | Y | tape sur les munitions |
| Principale / secondaire | Digit1 / Digit2 | — | — |
| Couteau | KeyV (V), Souris:3 (bouton latéral) | R3 | COUTEAU |
| Grenade létale (maintenir = cuire) | KeyG (G) | RB | GRENADE |
| Tactique (flash) | KeyQ (A) | LB | TACTIQUE |
| Séries 1 / 2 / 3 | Digit3 / Digit4 / Digit5 | croix ← ↑ → | icônes |
| Tableau (maintenir) | Tab | Back | SCORES |
| Pause | Escape | Start | ⏸ |

`keyLabel` (`settings.js:173`) apprend « CLIC G », « CLIC D », « MOLETTE », « SOURIS 4 » ; `listen()` (`ui.js:234`)
capture aussi `mousedown` et `wheel` pour réaffecter ; la liste en dur du bloc manette (`ui.js:45-57`) suit le profil.
Les chiffres 1-5 ne sont lus que par des ACTIONS (piège 1 des touches fantômes) ; `input.purger()` à chaque reprise
(pause, options, menus) : plus de saut ni de tir « en retard » (piège 2).
Deux raccourcis du navigateur à neutraliser : **Ctrl + la touche W** (Ctrl tenu pour s'accroupir + Marcher, qui est la
touche W en AZERTY) ferme l'onglet sans que la page puisse l'empêcher → C est la touche principale de l'accroupi, Ctrl la
secondaire, et `navigator.keyboard.lock()` en plein écran quand il existe ; les **boutons latéraux** de la souris
(3 et 4) font « page précédente » → `preventDefault()` sur `mouseup`/`auxclick` de ces boutons.

---------------------------------------------------------------------------------------------------------------------

## 14. PERFORMANCES

| Poste | Aujourd'hui | En partie (7 bots, PC) | Levier |
|---|---|---|---|
| Caméra | V2 0,126 ms | FPS ≈ 0,01 ms | pose directe |
| Haythem | 0,27 ms/pas | idem | — |
| Bots | 0,64 ms/image chacun (pose à 120 Hz) | ≈ 0,17 ms chacun (1,2 ms) | `poseParImage`, 4 Hz hors de vue |
| IA | — | ≈ 0,3 ms (perception 10 Hz, pensée 20 Hz, 1 A* par image) | étalement |
| Tirs | — | < 0,2 ms | DDA + capsules |
| Appels de dessin | 490-950 (moyenne), 880-1 710 (haute) | +≈ 100 | rue bornée (−40 % dans la rue), bots cachés par zone |
| Préréglage | auto, vise 45 im/s | **COMBAT** : vise 60 im/s, GTAO coupé sur puce intégrée (la haute = +80 % d'appels), ombres moyennes | `fx.budgetImage`, `fx.calme = false` en manche |

À mesurer dès le lot 2 sur le PC de Haythem, dans UN SEUL onglet (les mesures des lecteurs étaient faites avec 3
autres instances du jeu : 21 ms médians, pessimistes) : temps d'image en partie, appels au hall ouest et au −1, latence
souris (horodatage du `pointerrawupdate` contre `fx.render`).

---------------------------------------------------------------------------------------------------------------------

## 15. PRÊT POUR LE MULTIJOUEUR (sans le construire)

- **Commande** par acteur et par pas (§ 2.3) : `{ seq, axe: {x, y}, amp, sprint, tact, marche, saut, accroupi, tir, visee,
  recharger, interagir, arme: 0|1|±1, couteau, letale: 'presse'|'tenu'|'lache', tactique, serie, yaw, pitch }` — un bot,
  le clavier et un invité réseau passent par le même chemin ; recul et aide à la visée sont DÉJÀ dans `yaw/pitch`.
- **État** (`Partie.etat()`, nombres et chaînes) : `{ tick, graine, phase, stateT, chrono, scores, zones (Domination),
  acteurs: [{ id, equipe, vivant, vie, armure, x, y, z, vx, vz, yaw, pitch, accroupi, glisse, tactT, jumpY, jumpVel,
  arme: { i, armes: [{ id, chargeur, reserve }], etat, t, tirSeq, chaleur, reculI }, letales, tactiques, serie,
  reapparitionT, protectionT, stats }], projectiles: [{ type, x, y, z, vx, vy, vz, meche }], series: [...] }`.
- **Événements** : `{ t, type: 'tir'|'touche'|'elim'|'explosion'|'capture'|'serie'|'medaille', ... }` — l'affichage ne lit
  que ça ; un invité les recevra de l'hôte (images à 20/s de `js/enligne.js`, LA CAGE).
- **Hasard** : `Rng` de la partie, graine par tir `hachage(id, tirSeq)` ; jamais `Math.random()` dans la simulation.
- **Compensation de latence** : l'anneau de la killcam (§ 7.6) garde déjà les positions (et les capsules) d'1 s.
- Ce qui manquera : `y` dans `Tampon` (`carte_cage` § 2.3), `etatAnim`/`appliquerAnim` réécrits, salon
  `serveur/node.mjs` sur le port 8124 (LAN d'abord).

---------------------------------------------------------------------------------------------------------------------

## 16. ORDRE DE CONSTRUCTION (chaque lot se joue)

| Lot | Contenu | Jouable à la fin | Durée |
|---|---|---|---|
| 0 | `Input` (souris, molette, purge, fronts non liés, profils de touches), `pointerlockchange`, `game.partie` + crochets, menu principal minimal (BALADE / COMBAT) | la balade inchangée ; une partie vide | 1,5 j |
| 1 | vue FPS (caméra directe, ±85°, sensibilité FPS, champ), déplacements (course, sprint, sprint tactique, accroupi, glissade, saut avec élan), portes ouvertes, ascenseur hors service | on court dans toute l'école en 1re personne | 2,5 j |
| 2 | **FA-24 complet** : modèle, bras, passe d'arme, tir `balle()`, dispersion, recul, recharge, éclair + lumière, traceurs, impacts, douilles, son spatialisé, réticule, munitions, marqueur ; **stand de tir** | le ressenti se règle ici, sur cibles | 5 j |
| 3 | PM-9, P-17, FP-12, TP-50 (lunette), couteau, grenades, flash, changement d'arme, franchissement | tout l'arsenal au stand | 4 j |
| 4 | `nav.js` + `bots.js` (pilotage, perception, combat), vie, régénération, indicateurs, vignette, mort, réapparition | 1 contre 3 bots dans l'école | 6 j |
| 5 | modes MME / CPS / Domination, zones de jeu, apparitions, mini-carte, fil, tableau, fin de partie, caméra de mort | une vraie partie de 10 min | 4 j |
| 6 | progression, classes, accessoires, atouts, séries, médailles, armurerie, profil | on progresse | 3 j |
| 7 | manette (aide à la visée), tactile (CoD Mobile, tir auto), options COMBAT, chargement (astuces, `VERSION`), passe de performance | sur téléphone et à la manette | 3 j |
| 8 | killcam rejouée, poupées de chiffon complètes, inspection, finitions | | 3 j |

Environ 32 jours de travail ; le lot 2 est celui qui décide du « vrai gameplay » : rien ne vaut un stand de tir où l'on
règle cadence, recul, son et marqueur avant d'écrire une ligne d'IA.

---------------------------------------------------------------------------------------------------------------------

## 17. CE QUE LE PROP HUNT REPREND DU FPS

Les chasseurs SONT des combattants FPS (FA-24 + FP-12, flash = « sonar » optionnel) ; les props gardent la caméra V2
de la vue 3 (`carte_coeur` § 7.6). `armes.js` expose `surImpact(acteur, impact)` : en prop hunt, un tir sur le décor
(`balle().forme`, jamais un prop) coûte 2 PV au chasseur ; `balistique.js` teste les props (disques/boîtes de leur rayon
et hauteur) comme des corps. Même menu, même HUD (fil, scores, chrono), même verrou de porte (`P.force = false` sur la
porte 6 pendant la cachette), mêmes bots (`bots.js` avec un cerveau « cacheur »/« chercheur »).

---------------------------------------------------------------------------------------------------------------------

## 18. RISQUES

1. **La cadence sur la Radeon 660M** : 60 im/s n'est pas garanti (Game.frame médian 21 ms mesuré avec d'autres onglets
   3D) ; un FPS à 35 im/s ne « fait » pas CoD. Parade : préréglage COMBAT, rue bornée, ≤ 7 bots, pose par image, mesure
   seul dans un onglet dès le lot 2 ; sinon 4 bots par défaut.
2. **Une lumière ajoutée = 27 s figées** : la `PointLight` d'éclair doit exister avant la précompilation, et
   `sceneArme` ne change jamais son nombre de lumières ; au téléphone, aucune.
3. **Programmes neufs au premier tir** (arme, effets, bots, lunette) : tout préparer sous l'écran de chargement, sinon
   des gels de 0,1 à 5 s (10 avatars neufs sans précompilation : 4,96 s figées).
4. **Retouches de `Player`** (pose par image, élan en l'air, sprintMul, sansRangs) : la balade est réglée finement ; tout
   passe par des drapeaux éteints par défaut, et la balade se rejoue après chaque lot (escaliers, rangs, sièges).
5. **La capture du pointeur** : `unadjustedMovement` absent de Firefox ; Échap avalé ; recapture refusée 1 s ; un
   aperçu en iframe peut tout refuser.
6. **Bots ridicules ou tricheurs** : ligne de vue sur le monde solide seulement (feuillage sans forme : on se voit au
   travers des arbres de la rue) ; navigation à reprendre si des portes sont refermées ; à régler au chiffre près sur des
   parties réelles.
7. **Les visages des amis comme cibles** : demander leur accord à chacun (Gabriel, Imad, Marc-Antoine, Koji, Djafar,
   Ethan…) avant d'en faire des ennemis qu'on abat ; option « avatars anonymes » (passants recolorés, noms génériques).
8. **Un jeu de tir dans une vraie école reconnaissable** : sans sang ni cadavres, et c'est pour lui et ses amis. Mais
   publié (TikTok, réseau de l'école), il peut être très mal reçu. Un habillage « laser game / airsoft » (impacts de
   peinture, « TOUCHÉ » au lieu d'« ÉLIMINÉ », le touché qui pose un genou et lève la main au lieu de la poupée) ne
   change aucune mécanique et coûte une journée : je le recommande au moins pour tout ce qui sort de son PC.
9. **Taille du chantier** (~8 000 lignes) : chaque lot jouable, le stand de tir avant l'IA, sinon on se perd dans les
   bots sans savoir si tirer est agréable.
10. **Le son** : 24 voix spatialisées et filtres d'occlusion coûtent au téléphone ; pool strict et bruit précalculé.
11. **Marques** : ni nom, ni logo, ni son enregistré de Call of Duty ; armes aux noms inventés, sons synthétisés.
12. **Réglages enregistrés** : de nouvelles actions et un second profil de touches dans `iris.settings.v1` ; `load()`
    doit réparer sans casser les touches de la balade déjà choisies par Haythem.
