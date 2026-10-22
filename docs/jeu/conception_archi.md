# IRIS — CONCEPTION : FPS + PROP HUNT, ARCHITECTURE ET RISQUES TECHNIQUES

Concepteur « architecture et risques », 22/10/2026. Base : `C:/Users/hgami/Downloads/IRIS`, master `a8b22dd` (v2.0),
three r170 sans bundler (importmap → `vendor/three`). Sources : les cinq cartes du dossier `scratchpad/jeu/`
(`carte_coeur.md`, `carte_monde.md`, `carte_persos.md`, `carte_props.md`, `carte_cage.md`) et une relecture des points
d'accroche dans le code (toutes les lignes citées ont été revues sur `a8b22dd`). Aucun fichier du dépôt n'a été modifié.

Repère : MONDE `X = x du plan`, `Z = −y du plan`, `Y` vers le haut, RDC à 0, −1 à −3,06, 1er à 3,50, 2e à 6,60.

---------------------------------------------------------------------------------------------------------------------

## 0. LES DÉCISIONS EN UNE PAGE

1. **`game.mode` ne change pas de sens.** Il garde `'lobby'` pour « en jeu » (14 lectures dans 5 fichiers). On ajoute
   `game.partie` : `null` = la balade d'aujourd'hui, sinon une instance de `Partie` (FPS, prop hunt, stand, essai).
   Un nouveau mode `'menu'` (comme le `enterMenu` de LA CAGE) sert au menu principal : pour les 14 lectures, c'est
   « pas en jeu », comme `'chargement'`.
2. **Tout le neuf vit dans `js/jeu/`**, un fichier = un lot propriétaire. Les fichiers EXISTANTS sont touchés une
   fois par un SOCLE (des « prises » de 1 à 10 lignes), puis appartiennent à UN seul lot (tableau § 6.2). Les lots
   écrivent du code contre des **contrats figés par le socle** : chaque fichier de `js/jeu/` existe dès le socle,
   avec ses signatures exactes et un corps minimal qui marche (« squelette qui marche »). Le jeu tourne de bout en
   bout dès la fin du socle ; chaque lot remplace ses corps.
3. **Une seule boucle, à pas fixe de 1/120 s** (`js/game.js:459-472`). En partie, `Game.update` (l. 507) délègue à
   `Partie.pas(dt)`, qui fait TOUT le monde dans le même ordre : commandes → déplacement → armes → règles. Les bots
   **simulent** à 120 Hz (≈ 15 µs) mais ne sont **posés** (clips, couches, IK) qu'une fois par image affichée, et
   moins s'ils sont loin ou cachés : la pose coûte 8 fois le déplacement (65 µs contre 7,8 µs, carte_cage § 3).
4. **La COMMANDE est le pivot** : un petit objet de nombres et de booléens, une par acteur et par pas. Le clavier, un
   bot ou (plus tard) un invité réseau la remplissent ; ni `Player`, ni les armes, ni les règles ne lisent `Input`.
   L'état de partie est sérialisable (`etat()` / `appliquer()`), le hasard passe par un `Rng` à graine (celui de
   `net.js` de LA CAGE), les effets et les sons ne partent que d'ÉVÉNEMENTS. C'est tout ce qu'il faut aujourd'hui
   pour un hôte autoritaire demain.
5. **Les balles et la vue des bots ne touchent JAMAIS les maillages.** Raycaster : 19 ms le rayon ; DecalGeometry :
   31 ms l'impact. On tire sur le monde solide (`js/collisions.js`) par un parcours DDA de sa grille de 2 m
   (7,9 µs pour une vue, ≤ 30 µs pour une balle de 30 m), plus les 53 sols, plus des capsules de corps calculées
   depuis l'état SIMULÉ (pas les os) : déterministe, bon marché, rejouable par un hôte.
6. **La navigation est générée au lancement de la première partie** (0,7 s sur PC, sous un écran « PRÉPARATION »),
   gardée dans IndexedDB sous une empreinte du monde solide ; pas de fichier précalculé (il deviendrait faux à la
   première retouche de la carte, dont celle de la vidéo).
7. **Les portes automatiques sont FIGÉES pendant une partie** (table § 5.18) : ouvertes à demeure sur les chemins de
   jeu, fermées (des murs) sur les culs-de-sac. Les bots arrivent 100/100 au lieu de 64/100, l'état est
   déterministe, rien à synchroniser en réseau. L'ascenseur est coupé.
8. **Aucune lumière ajoutée en jeu** (une lumière de plus = 27 s d'image figée). Éclair de bouche = quads additifs +
   bloom. Tout ce qui bouge est enfant direct de la scène avec `userData.dynamique = true`.
9. **Les bots sont chargés au lancement de la partie, pas au démarrage du jeu** : le démarrage de la balade ne
   bouge pas (32,7 s mesurés, à ne pas allonger). Avatars des bots en `assets/tel/` même sur PC (136 Mo de mémoire
   graphique pour 6 avatars au lieu de 376), 6 avatars distincts au plus (3 au téléphone).
10. **Un harnais de test `window.__jeu`** (socle) avec un fichier de tests par lot, lancé par `?test=1` ; chaque lot
    a des seuils chiffrés (§ 12) et ne se déclare fini que s'il les passe.

Ordre : **SOCLE** (1 agent, ≈ 1,5 j) → **VAGUE 1** (10 lots en parallèle, ≈ 3-4 j) → **INTÉGRATION** (1 agent,
≈ 2 j) → plus tard le registre des meubles et le réseau. La retouche de la vidéo (lot R) peut tourner en même temps :
elle possède ses fichiers de carte, et le seul lot de gameplay qui touche la carte (L-M) passe après elle.

---------------------------------------------------------------------------------------------------------------------

## 1. LES RÈGLES DE CONSTRUCTION (valables pour tous les lots)

1. Français partout : identifiants, textes, commentaires, dans le style dense du code existant (en-tête de fichier
   qui dit le pourquoi, chiffres mesurés dans les commentaires, `(…)` pour les apartés).
2. Un fichier = un propriétaire. Un lot ne modifie aucun fichier d'un autre lot ; il demande à l'intégration.
   `tools/proprietaires.json` (créé par le socle) liste les fichiers de chaque lot ; `python -I
   tools/verifier_proprietaires.py lot/<nom>` refuse une branche qui touche un fichier hors de sa liste.
3. Les signatures du socle sont figées. Un lot peut AJOUTER des méthodes ; en changer une existante passe par
   l'intégration.
4. Dans la simulation (tout ce qui est appelé depuis `Partie.pas`) : ni `Math.random()`, ni `performance.now()`, ni
   `Date.now()`, ni lecture d'`Input`, ni lecture d'os ou de matrices d'affichage. Le hasard : `partie.rng`. Le temps :
   `partie.t` / `partie.tick`. Les entrées : la commande. (Le décor, les couches, les effets gardent leur
   `Math.random`.)
5. Les effets, les sons, les vibrations, le HUD réagissent aux ÉVÉNEMENTS de la partie (`partie.sur(type, fn)`),
   jamais par un appel direct depuis la simulation.
6. Tout objet ajouté à la scène en jeu : enfant DIRECT de `game.scene`, `userData.dynamique = true`
   (`js/ombre_cache.js:145-151`, `js/ombres_contact.js:200-208`, `js/kit_decor.js:160`), matériaux compilés sous
   l'écran de préparation (`Player.preparerRendu`, `js/game.js:186-211`). Jamais de lumière ajoutée, retirée,
   cachée, ni de `castShadow` de LUMIÈRE changé.
7. Jamais de `THREE.Raycaster` sur la scène, jamais de `DecalGeometry`, jamais de matériau du décor modifié (ils sont
   partagés et dédupliqués : `material.clone()` d'abord).
8. Pas de requête au monde solide dans le rappel d'une autre (`Collisions._parcourir` et `_tour` ne sont pas
   réentrants, `js/collisions.js:191`).
9. Chaque lot travaille dans son arbre git (`git worktree add ../IRIS_lots/<lot> -b lot/<lot> socle`), sert son
   arbre sur SON port (`python serve.py 81xx`, table § 6.3), dans UN onglet, et ferme onglet et serveur à la fin.
   Les millisecondes mesurées pendant la vague 1 sont relatives (d'autres onglets 3D tournent) ; les budgets
   absolus se vérifient à l'intégration, machine calme.
10. Le banc des lecteurs (`scratchpad/jeu/banc/*.js`) est JETABLE : un lot qui en reprend du code le recopie dans
    `js/jeu/` dans son premier commit.

---------------------------------------------------------------------------------------------------------------------

## 2. VUE D'ENSEMBLE

### 2.1 Arborescence (tout est neuf sauf mention)

```
js/jeu/
  index.js              S0   installerJeu(game, deps) : modes, menu au démarrage, globales, harnais
  constantes.js         S0   OEIL, BORNES_JEU, EQUIPES, NIVEAUX, TAILLES_TEL… (figé)
  rng.js                S0   Rng (xorshift32, copie de LA CAGE net.js:224-238), hacher(etat)
  commande.js           S0   creerCommande, viderCommande, copierCommande, CHAMPS_COMMANDE
  acteur.js             S0   class Acteur (corps Player + vie + arsenal + cerveau + prop + stats)
  partie.js             S0   class Partie (base) : phases, acteurs, événements, pas/image/camera, etat/appliquer
  partie_essai.js       S0   PartieEssai : Haythem armé + mannequins, sans règles (sert aux tests de tous)
  harnais.js            S0   window.__jeu (§ 12) ; charge tests/*.js sous ?test=1 (import dynamique)
  mouvement.js          L-B  appliquerCommande(acteur, cmd, dt, partie), oeil, accroupi, saut borné
  entrees_jeu.js        L-B  lireCommande(input, game, cmd, profil)
  vue_fps.js            L-B  VueFPS : caméra 1re personne directe, pointeur, champ, visée, recul, balancement
  camera_orbite.js      L-B  CameraOrbite : 3e personne générique (prop, mort, spectateur)
  viewmodel.js          L-B  Viewmodel : bras de Haythem + arme, scène et caméra à part (superposition fx)
  modeles_armes.js      L-B  creerArme(id, { pourVue }) : armes en primitives, repères crosse/poignée/garde/bouche
  armes.js              L-A  ARMES (fiches), class Arsenal (cadence, chargeur, recharge, visée, dispersion, recul)
  balistique.js         L-A  class Balistique : vue(), balle(), tirer() — DDA sur la grille + sols + capsules
  touches.js            L-A  capsules(acteur) depuis l'état simulé, rayonCapsules(), ZONES_TOUCHE
  grenade.js            L-A  grenades : vol à 120 Hz, rebonds sur le monde solide, explosion, dégâts à vue
  avatars.js            L-C  FICHES_BOTS, preparerAvatars, creerCorps, libererCorps
  teintes.js            L-C  teinteEquipe(player, equipe) (appliquerFit de LA CAGE fit.js:403-437, adapté)
  pose_arme.js          L-C  poserArme(acteur) (banc/armer.js), branché sur Player.apresPose
  accroupi.js           L-C  accroupir(player, k) (banc/accroupi.js)
  poupee.js             L-C  class Poupee (banc/ragdoll.js + murs)
  visibilite_acteurs.js L-C  CadenceActeurs : qui est dessiné, posé, ombré, à quelle cadence
  nav.js                L-D  class Nav : génération, A* fractionnable, champs de distance, zones, niveaux
  nav_cache.js          L-D  IndexedDB 'iris.nav' (clé = empreinte du monde + table des portes)
  pilotage.js           L-D  class Pilote : suivre un chemin (ficelle par balayage), arrivée, coincé, évitement
  cerveau.js            L-D  DIFFICULTES, class Cerveau (FPS) : perception, décisions, visée, tir
  apparitions.js        L-D  POINTS_APPARITION (par zone), choisirApparition(partie, acteur)
  partie_fps.js         L-E  PartieFPS (Mêlée, Équipes) : vie, régénération, éliminations, réapparition, fin
  partie_stand.js       L-E  PartieStand : stand de tir chronométré, records (motif de LA CAGE training.js)
  partie_prop.js        L-F  PartieProp : cachette → traque → fin, sifflets, pénalités, deux manches
  deguisements.js       L-F  catalogue (extraction par boîte, phase 1), deguiser(), prop au sol
  cerveau_prop.js       L-F  CerveauProp (cacheur), CerveauChasseur (soupçon)
  hud_fps.js            L-G  HudJeu (réticule, vie, munitions, fil, touches, dégâts, chrono, annonces)
  hud_prop.js           L-G  HudProp (phase, props restants, sifflet, déguisement)
  tableau_scores.js     L-G  TableauScores (Tab / Back maintenu)
  menus_jeu.js          L-G  MenuJeu (accueil, réglage de partie, fin de partie, préparation, crédits)
  effets.js             L-H  Effets : impacts, traceurs, douilles, éclairs, étincelles (pools en InstancedMesh)
  sons_jeu.js           L-H  SonsJeu : tirs, recharges, touches, pas des acteurs, sifflet, buzzer
  assistance_visee.js   L-I  ralentissement et aimantation légère (manette, tactile), tir automatique tactile
  monde_partie.js       L-M  modePartie(carte, table) / restaurer() : portes figées, ascenseur coupé
  tests/test_<lot>.js   chaque lot le sien (socle, armes, vue, corps, nav, fps, prop, hud, effets, mobile, monde)
css/jeu/hud.css         L-G     css/jeu/menus.css   L-G     css/jeu/tactile.css   L-I
tools/proprietaires.json, tools/verifier_proprietaires.py   S0
```

### 2.2 Qui dépend de qui (flèche = « importe »)

```
                          game.js (prises S0)
                              │ appelle (sans importer js/jeu : pas de cycle)
     main.js ──► jeu/index.js ──► menus_jeu ─┐
                    │                         ├──► partie_fps / partie_prop / partie_stand / partie_essai
                    └──► harnais               │            │
                                               ▼            ▼
                                            partie.js ◄── acteur.js ◄── commande.js, rng.js, constantes.js
                                               │
          ┌──────────────┬─────────────┬───────┴──────┬──────────────┬───────────────┐
          ▼              ▼             ▼              ▼              ▼               ▼
     mouvement      armes ──► balistique ◄── touches   cerveau ──► pilotage ──► nav  avatars/pose_arme/poupee
     entrees_jeu    grenade        ▲                    │  ▲                         visibilite_acteurs
     vue_fps ──► viewmodel ──► modeles_armes ◄─────────┼──┼── pose_arme
     camera_orbite                 ▲                    │  └── cerveau_prop, apparitions
                                   │                    ▼
     hud_* , tableau, effets, sons_jeu, assistance_visee : abonnés aux ÉVÉNEMENTS de la partie (aucun import inverse)
```
Les modules d'affichage (HUD, effets, sons, viewmodel) n'importent jamais une règle ; les règles n'importent jamais un
module d'affichage : elles émettent des événements. C'est la séparation hôte/client de demain.

---------------------------------------------------------------------------------------------------------------------

## 3. LA BOUCLE, PAS À PAS

### 3.1 `Game.frame(dt)` (js/game.js:444-492) après le socle

```
fx.debutImage()
body.en-jeu <- mode === 'lobby'                                  (inchangé)
input.scruter(game, dt)                                          (inchangé : manette)
audio.setListener(camera.position)                               (L-H ajoute l'orientation dans audio.js)
wheelAte = updateEmoteInput(dt)                                  (+ la roue reste fermée si partie : l. 410)
pressed('pause') -> togglePause()                                (inchangé ; boutons fournis par la partie)
if (!partie) pressed('phone') -> cb.onPhone()                    (l. 452 : prise S0)
if (!partie) pressed('camera') -> vue suivante                   (l. 453 : prise S0)
si !paused : pas fixes 1/120 → this.update(FIXED_DT)             (inchangé)
   └─ update(dt) : if (this.partie) { this.partie.pas(dt); return; }   (prise S0, AVANT user.memoriser l. 508)
interpoler()  → partie ? partie.interpoler(a) : user.presenter(a)     (l. 502 : prise S0)
updateCamera(paused ? 0 : dt) → if (partie?.camera(dt, poser)) return; (l. 1005 : prise S0, après freeCam)
partie?.image(paused ? 0 : dt)                                   (prise S0 : poses, cadence, viewmodel, HUD, effets)
carte.maj(dt, partie ? partie.jeuCarte : this)                   (l. 478 : prise S0 — spectateur plus tard)
weather, onTick, animate, ombres.update, préchauffe              (inchangé)
fx.calme = !partie || partie.calme()                             (l. 487 : prise S0 ; faux pendant une manche)
fx.render(dt)                                                    (la superposition du viewmodel y est, § 5.8)
input.endFrame()                                                 (S0 : vieillissement et purge des fronts)
```

### 3.2 `Partie.pas(dt)` (120 Hz) — l'ordre est un contrat

```
1. tick++, t += dt ; pour chaque acteur : joueur.memoriser()
2. COMMANDES
   - acteur local (humain) : lireCommande(game.input, game, a.cmd, profil)      (fronts consommés ICI, une fois)
   - bots : a.cerveau.commande(dt, a.cmd)   (pense à 30 Hz : (tick + 3·id) % 4 === 0 ; perçoit à 10 Hz :
            (tick + 7·id) % 12 === 0 ; entre deux, garde sa décision et ne fait que lisser sa visée)
   - (plus tard) distants : la dernière commande reçue, rejouée
3. DÉPLACEMENT : pour chaque acteur vivant : appliquerCommande(a, a.cmd, dt, partie)
   = capFixe sur cmd.lacet, allure (accroupi ×0,45, visée ×0,65, arme), joueur.move, saut borné par le plafond,
     accroupi qui glisse en 0,15 s, joueur.simuler(dt)
4. (facultatif, L-E) contacts entre corps : séparation à 0,5 m (LA CAGE game.js:2170-2193, sans `push` : sur pos)
5. ARMES : a.arsenal.pas(dt, a.cmd, partie) → tirs → balistique.tirer() résolu TOUT DE SUITE (hitscan),
   grenades lancées → grenade.js ; dégâts → partie.infliger() → événements 'touche' / 'elim'
6. PROJECTILES : grenades.pas(dt) (vol, rebonds, explosion → dégâts à vue)
7. RÈGLES (la sous-classe) : regles(dt) — régénération, réapparitions, chrono, phases, score, fin
8. TÂCHES DE FOND bornées : nav.pasFile() (au plus UN calcul de chemin par pas, 1 500 nœuds ouverts par tranche)
```
Coût visé de `Partie.pas` complet : **≤ 0,5 ms sur PC avec 7 bots** (6 pas au plus par image : 3 ms au pire),
≤ 0,6 ms au téléphone avec 3 bots. Au-delà, la partie se dégrade d'elle-même (perception à 5 Hz, pensée à 15 Hz).

### 3.3 `Partie.image(dt)` (une fois par image)

```
1. cadence.maj(acteurs, camera, imageN)  → pour chacun : dessine (zones + cadre), aPoser (toutes les images à
   < 18 m et à l'écran, 1 sur 3 au-delà de 34 m, 4 Hz caché), ombre (même niveau que la caméra)
2. pour chaque acteur à poser : joueur.poser(dtCumulé, true)   (clips, couches, puis Player.apresPose :
   accroupi → arme ; le corps du joueur local en vue FPS n'est jamais posé)
3. corps morts : poupee.pas / poser (visuel seulement, hors état)
4. props : racine du meuble suit posAff / angAff (pas le tangage des couches)
5. viewmodel.maj(dt, etatVue) ; effets.maj(dt) ; hud.maj(dt, partie.hud) ; sons : rien (événements)
```
L'interpolation (`interpoler`) a déjà posé `mesh.position = posAff` : la pose se fait APRÈS, sur la position
affichée (piège du socle, § 4.2).

---------------------------------------------------------------------------------------------------------------------

## 4. LE SOCLE (lot S0) — les prises, ligne par ligne

Un seul agent, en premier, sur `master` → branche `socle`. Il ne fait AUCUN gameplay : des prises, des contrats, des
corps minimaux qui marchent, le harnais. Sortie : le jeu démarre sur un menu, la balade est identique, « ESSAI »
pose Haythem armé (tir par `rayonLibre`, 25 dégâts) devant trois mannequins, et `__jeu.tests('socle')` passe.

### 4.1 `js/game.js` (après le socle : intégration seulement)

| Ligne(s) a8b22dd | Changement |
|---|---|
| 215-216 (après `this.user`) | `this.partie = null; this.siegesTous = this.carte.siegesTous \|\| this.sieges.slice();` (piège 9 de carte_coeur : la liste est refiltrée par niveau ensuite) |
| 238 `_onClick` | en partie : `this.partie.capturer?.()` (la vue FPS demande `requestPointerLock({ unadjustedMovement: true })`, repli sans option sur `NotSupportedError`) ; hors partie, inchangé |
| 239-240 `_onDown/_onUp` | `dragging` seulement `if (!this.partie)` (en FPS, le clic gauche tire, il ne tourne pas la caméra) |
| 241-249 `_onMove` | bornes `const [lo, hi] = this.bornesTangage();` au lieu de `-0.1, 0.9` ; sensibilité × `(this.partie?.multSensi?.() ?? 1)` (visée) ; en partie, `\|movementX\| > 400` ignoré (sauts de Chrome sous Windows) |
| 302 `applySettings` | `this.input.setBindings(...)` → `this.appliquerProfil()` (profil `this.partie?.profil \|\| 'balade'`, § 10) |
| 410 `updateEmoteInput` | `if (this.paused \|\| this.mode !== 'lobby' \|\| inp.blocked \|\| this.partie)` (la roue des provocations du prop hunt est la sienne) |
| 432-442 `togglePause` | boutons = `this.partie ? this.partie.boutonsPause() : [...]` ; balade : + « Modes de jeu » (→ `this.entrerMenu()`) ; à la reprise `this.input.purger()` ; en partie, la reprise redemande le pointeur |
| 452, 453 | `if (enJeu && !this.partie && …)` |
| 475-476 (après `updateCamera`) | `this.partie?.image(this.paused ? 0 : dt);` |
| 478 | `this.carte.maj?.(this.paused ? 0 : dt, this.partie ? this.partie.jeuCarte : this);` |
| 487 | `this.fx.calme = !this.partie \|\| this.partie.calme();` |
| 502-505 `interpoler` | `if (this.partie) this.partie.interpoler(a); else this.user.presenter(a);` |
| 507-508 `update` | première ligne : `if (this.partie) { this.partie.pas(dt); return; }` |
| 1006 (après `freeCam`) | `if (this.partie && this.partie.camera(dt, poser)) return;` |
| nouvelles méthodes (après l. 442) | `bornesTangage()` → `this.partie ? [-1.48, 1.48] : [-0.1, 0.9]` ; `entrerMenu()` (mode `'menu'`, HUD caché, pointeur libéré, `input.purger()`, événement `iris-menu`) ; `async lancerPartie(Classe, opts)` (préparation, `this.partie = p`, `p.entrer()`, `this.enterLobby()`, `appliquerProfil()`, `document.body.classList.add('combat')`, événement `iris-partie`) ; `quitterPartie()` (`p.sortir()`, `partie = null`, profil balade, `placerAuDepart()`, classe retirée, événement) ; `appliquerProfil()` |

`game.js` n'importe rien de `js/jeu/` : `lancerPartie` reçoit la classe. Aucun cycle de modules.

### 4.2 `js/player.js` et `js/couches.js` (après le socle : lot L-C)

- **Découpe de `update(dt)` (l. 1068-1136) sans changer la balade** :
  `update(dt) { this._annulerCouches(); this.simuler(dt); this.poser(dt, false, true); }` dans l'ORDRE EXACT
  d'aujourd'hui. `simuler(dt)` = saut (l. 1072-1075), `landT` (1076), minuteries d'emote (1077-1082), virage vif
  (1084-1085), téléphone (1086-1093), assis (1099-1106, il écrit `pos`), `this.ang = atan2(facing)` (1121).
  `poser(dt, affiche = false, dejaAnnule = false)` = annulation des couches (1070) sauf `dejaAnnule`, `animT/walkPhase`
  (1096-1098), pose, `_driveAnim`, fondu (1107-1120), `couches.dynamique`, `_poserSol`, mise en place du groupe
  (1122-1136), couches des os ; **avec `affiche = true`, le groupe reste à `posAff/angAff` posés par `presenter`**
  (sinon le bot saute de 8 ms en 8 ms). Puis `if (this.apresPose) this.apresPose(this, dt);` (accroupi, arme : L-C).
  Contrôle : test « balade bit-identique » (§ 12.3).
- `move` (l. 673-724) : `this.rayon ?? RAYON_JOUEUR` (l. 704, et l. 826 dans `_sortirRang` : props) ; `if (this.capFixe)` : ni
  `faceWant = vitesse` (l. 721) ni `turnTo` (l. 723) — le cap vient de la commande (pas chassés et marche arrière
  sortent seuls de `_sensLoco`) ; `if (this.sansRangs)` : pas d'`_entrerRang` (l. 682 ; un bot poussé contre un rang
  s'y faufilait).
- `dispose()` (n'existe pas, piège 16) : `disposed = true`, `scene.remove(mesh)`, `telMesh`, matériaux clonés
  (l. 237-247), mélangeur arrêté.
- Chargeur DISCRET (l. 53-62) : `def.discret` → un `GLTFLoader(new THREE.LoadingManager())` à part, pour que les
  avatars des bots ne déclenchent pas `DefaultLoadingManager.onLoad` (dans les 30 s après la construction, il
  recuit l'ombre du sol, la carte d'environnement et le cache d'ombre : `js/kit_decor.js:441-452`).
- `couches.js` : l. 124 et 328, `(p.mesh.visible || p.vuePremiere)` → `(p.audible ?? (p.mesh.visible || p.vuePremiere))` :
  en partie `audible = false` (les pas des acteurs viennent de la SIMULATION, § 5.16 — un bot caché ou posé à 4 Hz
  doit s'entendre) ; l. 186-191 : `if (p.sansSouffle) this.veutSouffler = false` (un bot armé ne met pas les mains
  sur les genoux).

### 4.3 `js/input.js` (après le socle : intégration)

- Souris (constructeur, l. 15-37) : `mousedown`/`mouseup` → `presser('Souris:' + e.button)` / `relacher(...)`
  seulement si le pointeur est capturé ou si la cible est le canvas ; `wheel` → `presser('Molette:haut'|'Molette:bas')`,
  relâché dans `endFrame` ; `contextmenu` → `preventDefault()` sur le canvas.
- `document.addEventListener('pointerlockchange', …)` → `document.dispatchEvent(new CustomEvent('iris-pointeur',
  { detail: { capture } }))`. Le jeu (socle, dans `lancerPartie`) : capture perdue en partie, pas en pause, pas
  bloqué → `togglePause()` (le premier Échap avec pointeur capturé n'arrive JAMAIS en `keydown`, piège 5).
  Capture acquise → `relacher('Souris:0'); purger()` (le clic qui capture ne tire pas).
- `purger()` : vide `pressedSet` et `releasedSet` (pas `downSet`). Appelé à la reprise, à la sortie du menu, des
  options (`main.js` onClose), du téléphone.
- `endFrame()` (l. 77, vide aujourd'hui) : (1) retire de `pressedSet/releasedSet` tout code qu'AUCUNE action liée ne
  porte (corrige l'emote fantôme : `Digit3` jamais lu ; la roue lit ses chiffres dans la même image, avant
  `endFrame`) ; (2) oublie tout front plus vieux que 0,35 s (`Map code → t`, comme `FRONT_MAX` de touch.js:49) ;
  (3) relâche les codes de molette.

### 4.4 `js/settings.js` (après le socle : intégration)

- `ACTIONS` (l. 8-23) **inchangé** (sinon les actions de combat apparaîtraient dans l'onglet Commandes de la balade
  et `load()` (l. 94) les recopierait dans `controls.bindings`). À côté : `export const ACTIONS_COMBAT = [...]`,
  `ACTIONS_PROP = [...]` (tables § 10.1), chacune COMPLÈTE (déplacements compris : le sprint de la manette est RT
  en balade, L3 en combat).
- `DEFAULTS` (l. 30-57) : `controls.combat = { bindings, pad }`, `controls.prop = { bindings, pad }`,
  `controls.sensVisee: 0.75`, `controls.tactile.tirAuto: TELEPHONE`, `controls.pad.assistance: true`,
  `graphics.fov: 95` (déjà déstructuré et ignoré par `applySettings`, game.js:298), `game.demarrage: 'menu'`,
  `jeu: { mode: 'melee', bots: TELEPHONE ? 3 : 7, difficulte: 'regulier', duree: 8, avatars: [] }`.
- `load()` (l. 88-119) : répare chaque profil contre SA liste d'actions (deux emplacements, codes de manette côté
  manette). `bind(id, slot, code, profil = 'balade')`, `bindPad(..., profil)` : le dédoublonnage reste DANS le profil.
  `bindingsDe(profil)`, `padBindingsDe(profil)`.
- `keyLabel` (l. 173) : `Souris:0` « CLIC G », `Souris:2` « CLIC D », `Souris:1` « CLIC MOLETTE », `Molette:haut/bas`
  « MOLETTE ↑/↓ ». `actionKey(id, profil = game?.partie?.profil)` (l. 189).

### 4.5 Les autres prises du socle

| Fichier | Lignes | Prise | Propriétaire ensuite |
|---|---|---|---|
| `js/main.js` | 59-65, 79, 84 | après le tactile : `const jeu = installerJeu(game, { options, phone, touch: window.__touch, audio, ch })` ; `window.__jeu` (harnais) ; `commencer` → `audio.init(); plein?.demande(); jeu.demarrer();` (menu, ou balade si `?partie=balade` ou `game.demarrage === 'balade'`, ou la partie de `?partie=fps&bots=5&graine=7`) ; `onPhone` (l. 43) : `if (!game.paused && !game.partie && phone)` | intégration |
| `js/fx.js` | 616-620, 2062 | `this.superpositions = []` + une passe `PasseSuperposee` insérée APRÈS `this.oeil` (l. 618 : l'arme n'entre pas dans la mesure d'exposition, mais prend bloom, sortie, SMAA, étalonnage) qui dessine chaque `{ scene, camera }` avec `clear = false` et la profondeur effacée, `enabled` seulement si la liste n'est pas vide ; chemin sans composer (l. 2062, `!this.enabled`) : après `renderer.render`, `autoClear = false; clearDepth(); render(...)` | L-H |
| `js/manette_menus.js` | 16-20 | `export function ajouterRacine(id, { retour, defaut, avant })` (insère dans `RACINES`, `RETOUR`, `DEFAUTS`) ; `retour` (l. 340-344) : sur `overlay`, garde le comportement ; sur une racine qui a `data-retour-action`, « tape » cette action | L-I |
| `js/chargement.js` | 577 | `if (TRACE \|\| arg('test') === '1') go(null);` (les tests démarrent sans geste) | intégration |
| `index.html` | 23 | trois `<link rel="stylesheet">` : `css/jeu/hud.css`, `css/jeu/menus.css`, `css/jeu/tactile.css` (fichiers vides créés) | intégration |
| `tools/` | — | `proprietaires.json`, `verifier_proprietaires.py` (Python standard, `git diff --name-only socle...HEAD`) | intégration |

Les prises « carte » (portes, ascenseur, visibilité, sièges) ne sont PAS dans le socle : elles vont au lot L-M, qui se
coordonne avec la retouche de la vidéo (§ 6.4).

### 4.6 Les contrats posés par le socle (`js/jeu/*.js`)

Chaque fichier de § 2.1 est créé avec ses exports, ses signatures, un en-tête qui dit son lot propriétaire, et un
corps minimal :
- `armes.js` : une seule arme `fusil`, munitions infinies ; `balistique.js` : `vue()` = `C.rayonLibre(...,0) >= 1`,
  `balle()` = fraction de `rayonLibre`, normale = −direction ; `touches.js` : une capsule (pieds + 0,25 → + 1,7,
  r 0,25) ; `nav.js` : `chemin()` rend la ligne droite ; `cerveau.js` : se tourne vers l'ennemi le plus proche et tire
  une fois par seconde s'il le voit ; `vue_fps.js` : œil à 1,62, rotation directe (§ 5.8, convention) ;
  `viewmodel.js`, `effets.js`, `sons_jeu.js` : abonnés qui comptent les événements ; `hud_fps.js` : une ligne dans
  `hud.hint` (« VIE 100 · 30/∞ ») ; `menus_jeu.js` : `showOverlay` à quatre boutons (BALADE / COMBAT / PROP HUNT /
  ESSAI) ; `avatars.js` : clones de Haythem ; `partie_fps.js` : `PartieEssai` + réapparition ; `partie_prop.js` :
  « bientôt » ; `monde_partie.js` : ne fait rien.

---------------------------------------------------------------------------------------------------------------------

## 5. LES CONTRATS DES MODULES (API exacte)

Conventions : positions MONDE en mètres ; angles en radians ; `lacet` = `game.camYaw` (la direction de regard est
`(−sin lacet · cos tangage, −sin tangage, −cos lacet · cos tangage)`), `tangage > 0` = regard vers le BAS (convention
de `game.js`) ; durées en secondes de partie (`partie.t`).

### 5.1 `commande.js` (S0)

```js
// UNE COMMANDE par acteur et par pas : tout ce que la simulation a le droit de lire du dehors. Que des nombres et des
// booléens : elle voyagera telle quelle (invité → hôte), 20 à 30 fois par seconde.
export const CHAMPS_COMMANDE = ['seq', 'ax', 'ay', 'amp', 'sprint', 'saut', 'accroupi', 'tir', 'visee', 'recharger',
  'armeSuiv', 'armeN', 'couteau', 'grenade', 'deguiser', 'figer', 'provoquer', 'lacet', 'tangage'];
export function creerCommande()          // { seq: 0, ax: 0, ay: 0, amp: 0, sprint: false, …, armeN: 0, lacet: 0, tangage: 0 }
export function viderCommande(c)         // remet les FRONTS à faux (saut, recharger, armeSuiv, armeN, couteau, grenade, deguiser, figer, provoquer)
export function copierCommande(de, vers)
export function versTableau(c) / depuisTableau(t, c)   // (réseau plus tard : 19 valeurs)
```
`ax, ay` : l'axe RELATIF au lacet (comme `input.axis()` : x droite, y avant), `amp` 0..1 ; `tir, visee, sprint,
accroupi` : TENUS ; les autres : fronts (un appui = vrai sur UN pas). `armeN` : 0 = rien, 1-3 = arme demandée.

### 5.2 `rng.js` (S0)

`export class Rng` = copie de `Rng` de LA CAGE (`js/net.js:224-238`, xorshift32 : `seed(s)`, `next()`, `range(a, b)`,
`int(n)`, `pick(arr)`) + `get etat()` / `set etat(v)` (un entier : il voyage dans l'état). `export function
hacher(objet, precision = 1e-4) → string` (FNV-1a sur le JSON arrondi : l'empreinte des tests de déterminisme).

### 5.3 `acteur.js` (S0)

```js
export class Acteur {
  constructor(partie, { id, nom, equipe, fiche, local = false, cerveau = null })
  id; nom; equipe;            // 'A' | 'B' | 'props' | 'chasseurs' | null (mêlée)
  joueur;                     // Player d'IRIS (le corps) : capFixe = true, sansRangs = true, audible = false
  local;                      // vrai pour Haythem au clavier/manette/doigt de CETTE machine
  cmd;                        // creerCommande()
  cerveau;                    // Cerveau | CerveauProp | CerveauChasseur | null
  vie; vieMax; vivant; mortT; reapparitionT; derniereTouche;   // (derniereTouche : { t, par, arme } — assistances)
  arsenal;                    // Arsenal | null (un prop n'en a pas)
  accroupi;                   // 0..1 (glisse en 0,15 s)
  prop;                       // null | { cle, rayon, hauteur, pv, racine, fige, rot }
  stats;                      // { elims, morts, tetes, tirs, touches, assists, score }
  poupee;                     // Poupee | null (visuel)
  dessine; aPoser; poseT;     // posés par CadenceActeurs (affichage)
  get pos() { return this.joueur.pos; }
  oeil(out, affiche = false)  // pieds + OEIL(accroupi) × h/1,73 (+ jumpY) ; posAff si affiche
  etat() / appliquer(e)       // § 13.2
}
```

### 5.4 `partie.js` (S0) — la base de toutes les règles

```js
export class Partie {
  constructor(game, opts)     // opts : { graine, bots, difficulte, duree, scoreCible, avatars, humain = true, … }
  game; opts; id;             // 'essai' | 'melee' | 'equipes' | 'prophunt' | 'stand'
  profil;                     // 'combat' | 'prop' (profil de touches, § 10)
  rng; tick; t;               // Rng(graine), compte de pas, temps de partie
  phase; phaseT;              // 'preparation' | 'decompte' | 'manche' | 'fin_manche' | 'fin' (+ 'cachette', 'traque')
  acteurs; local;             // tableau ; l'acteur local (ou null en spectateur)
  balistique; nav; grenades;  // posés par preparer()
  hud;                        // l'état du HUD (§ 5.15), rempli par les règles, lu par le HUD
  async preparer(progres)     // progres(etape, f) : graphe, avatars, catalogue, effets compilés ; rend quand tout est prêt
  entrer() / sortir()         // monde_partie.modePartie / restaurer, profil, corps, abonnés, classe 'combat'
  pas(dt)                     // § 3.2 — NE PAS surcharger ; surcharger regles(dt)
  regles(dt)                  // la sous-classe
  interpoler(a)               // presenter(a) de chaque acteur vivant
  camera(dt, poser) → bool    // vue FPS de l'acteur local vivant, CameraOrbite sinon ; faux = caméra de balade
  image(dt)                   // § 3.3
  calme() → bool              // vrai hors 'manche' / 'traque' (la qualité peut remonter), faux sinon
  boutonsPause() → [{ label, cls, onClick }]   // Reprendre, Options, Commandes, Recommencer, Quitter la partie
  get jeuCarte()              // this.game (plus tard : Object.create(game, { user: { value: suivi.joueur } }))
  multSensi() → number        // 1, ou settings.controls.sensVisee × visée en cours
  capturer()                  // demande du pointeur (délégué à la vue FPS)
  ajouterActeur(def) → Acteur ; retirerActeur(a)
  infliger(cible, degats, { par, arme, zone, point, dir }) // la SEULE porte des dégâts (événements, éliminations)
  evt(type, data)             // pousse { t, type, ...data } dans this.evenements (anneau de 256) et appelle les abonnés
  sur(type, fn) → desabonner  // '*' pour tout
  etat() → objet JSON ; appliquer(e) ; empreinte() → string
}
```
**Les événements** (tous en nombres et chaînes, ids d'acteurs, jamais d'objets three) :
`tir { a, arme, ox, oy, oz, dx, dy, dz, n }` · `impact { x, y, z, nx, ny, nz, mat, forme }` · `touche { par, cible,
zone, degats, x, y, z, tete }` · `elim { par, cible, arme, tete, x, y, z, ix, iy, iz }` · `apparition { a }` ·
`recharge { a, phase: 'debut'|'insere'|'fin' }` · `arme { a, id }` · `vide { a }` · `grenade { a, x, y, z, vx, vy,
vz }` · `explosion { x, y, z, r }` · `pas { a, x, y, z, f }` · `saut { a }` · `reception { a, f }` · `phase { phase,
duree }` · `annonce { texte, cls }` · `score { … }` · `deguise { a, cle }` · `sifflet { a, x, y, z }` ·
`provocation { a, id }` · `penalite { a, pv }` · `fin { gagnant, scores }`.

### 5.5 `mouvement.js` (L-B ; première version par le socle)

```js
export const OEIL = { debout: 1.62, accroupi: 1.08 };     // pour 1,73 m (× h / 1,73)
export function appliquerCommande(acteur, cmd, dt, partie)
export function hauteurOeil(acteur) → number               // au-dessus des pieds, accroupi et saut compris
export function sautPossible(acteur) → bool                // plafondEn(x, z, pieds) − (pieds + 1,73 + 0,345) > 0,05
```
Règles : `joueur.setFacing(−sin lacet, −cos lacet)` puis `move` (capFixe) ; direction monde = axe tourné de `lacet`
(comme game.js:530-535) ; `speedMul` = accroupi 0,45 × visée 0,65 × `arme.vitesse` ; pas de sprint en visée, en
recharge, accroupi ; endurance en partie `staminaMul = 0,5` (≈ 9 s de sprint au lieu de 4,5) ; saut `jump(2.6)`
seulement si `sautPossible` (sinon l'œil, à 1,62 + 0,345 m, entre dans les linteaux à 2,04 m : piège 13 de
carte_monde) ; accroupi : glisse 0→1 en 0,15 s ; émet `pas` tous les 0,7 m (course), 0,45 m (marche), rien accroupi
lent (< 1,3 m/s) — c'est ce qui fait les sons de pas et l'ouïe des bots.

### 5.6 `entrees_jeu.js` (L-B)

`lireCommande(input, game, cmd, profil)` : le SEUL lecteur d'`Input` en partie. `down()` pour `tir, visee, sprint,
accroupi` (bascule possible : `controls.viseeBascule`), `pressed()` pour les fronts, `axis()`/`amplitude()`,
`lacet = game.camYaw`, `tangage = game.camPitch` (la souris écrit en direct, sans lissage), `seq++`. Tactile : codes
`Tactile:<action>` déjà rangés par `Input.setBindings` (input.js:41-49). Assistance : `assistanceVisee.corriger(cmd,
game, dt)` (L-I) est appelée ici, après lecture.

### 5.7 Armes, balistique, touches, grenades (L-A)

```js
// armes.js
export const ARMES = { fusil, mitraillette, pompe, pistolet, couteau, grenade };   // fiches § 5.7.1
export class Arsenal {
  constructor(acteur, dotation = ['fusil', 'pistolet'])
  pas(dt, cmd, partie)        // états : 'pret' | 'tir' | 'recharge' | 'change' | 'couteau' ; visée k 0..1
  get arme(); get chargeur(); get reserve(); get visee(); get dispersion();  // dispersion en rad (réticule)
  remplir(); etat(); appliquer(e)
}
// balistique.js
export class Balistique {
  constructor(collisions)
  vue(ax, ay, az, bx, by, bz) → bool        // pré-filtre zonesCachees/zoneDe (2 µs, jamais faux), puis DDA (8 µs) ; ignore vitres, joueur seul, off
  balle(ax, ay, az, dx, dy, dz, portee, out) → out   // { t, x, y, z, nx, ny, nz, mat, forme } ; mat 'mur'|'vitre'|'meuble'|'sol'|'plafond'|'rien'
  tirer(partie, tireur, ox, oy, oz, dx, dy, dz, arme) → { acteur, zone, t, x, y, z, decor }   // monde puis capsules, le plus proche gagne
}
// touches.js
export const ZONES_TOUCHE = { tete: 2.0, cou: 1.6, torse: 1.0, ventre: 1.0, bras: 0.8, jambes: 0.75 };
export function capsules(acteur, out)      // 5 capsules depuis l'ÉTAT SIMULÉ : pos, cap, accroupi, jumpY, penché ∝ vitesse
export function rayonCapsules(acteurs, ox, oy, oz, dx, dy, dz, tMax, sauf, out) → out   // { acteur, zone, t } | null
// grenade.js
export class Grenades { constructor(partie); lancer(acteur, cmd); pas(dt); etat(); appliquer(e) }
```
**Le DDA de `balle()`** : celui de carte_monde § 6, mais (1) il garde le PLUS PROCHE impact (arrêt quand le meilleur t
précède la sortie de la case courante) ; (2) il compte les formes `camera` ET `joueur` (les 75 meubles bas `camera:false`
arrêtent les balles) sauf `balle === false` (le « jour » de l'escalier, posé par L-M, carte_ecole.js:628) et `off` ;
(3) il teste les 53 sols de `C.sols` (dalles = plans bornés, rampes = plans inclinés) et le plan `y = 0` là où aucun sol
ne couvre (règle de `solEn`) — sans eux, 203 rayons sur 203 traversent le sol du −1 et 953 la rue ; (4) la normale sort
de la tranche d'entrée (`_segment` ne la rend pas : recalcul local pour la forme touchée) ; (5) il incrémente
`C._tour` lui-même et ne s'appelle jamais dans un rappel. Les vitres : impact + traversée (la balle continue,
dégâts ×0,8 ; un éclat d'impact). Coût visé : ≤ 30 µs médian à 30 m, ≤ 120 µs au 99e centile.

**Les capsules depuis l'état simulé** (pas les os) : tête (sphère r 0,115 × h/1,8 à `pieds + 1,62·h/1,73` +
avance ∝ vitesse), cou-torse (r 0,165), ventre (r 0,155), jambes (une capsule r 0,13 de pieds + 0,1 à hanches) — les
mesures de banc/touches.js. Déterministe, sans pose, 1,6 µs par capsule, et rejouable par un hôte avec 5 nombres
par acteur et par pas d'historique. Contrôle : écart tête simulée / os `Head` en course ≤ 6 cm en moyenne, ≤ 10 cm au
95e centile (§ 12.4) ; au-delà, L-C coupe le penché des couches pour un acteur armé.

#### 5.7.1 Les armes (point de départ, à régler au stand)

| | Fusil d'assaut | Mitraillette | Fusil à pompe | Pistolet | Couteau | Grenade |
|---|---|---|---|---|---|---|
| Cadence | 750 cpm, auto | 900 cpm, auto | 1 coup / 0,8 s | semi, 400 cpm max | 0,6 s | 1 par vie |
| Chargeur / réserve | 30 / 120 | 32 / 128 | 6 / 24 (par cartouche, 0,45 s) | 12 / 48 | — | — |
| Dégâts (×tête) | 28 (×2) → 20 au-delà de 25 m | 22 (×1,6) → 14 à 15 m | 8 plombs × 14, 12 m | 34 (×2) | 55 devant, 100 dans le dos | 100 à 1,5 m → 0 à 6 m, à vue |
| Recharge (vide) | 2,1 s (2,6) | 1,9 (2,3) | — | 1,5 (1,8) | — | mèche 3 s |
| Dispersion hanche / visée | 3,5° / 0,25° | 4,5° / 0,6° | 6° / 4° | 2,5° / 0,2° | — | — |
| Recul par coup | +0,55° haut, ±0,25° | +0,4°, ±0,4° | +4° | +1,2° | — | — |
| Visée : durée, zoom | 0,22 s, ×1,35 | 0,18 s, ×1,2 | 0,25, ×1,1 | 0,15, ×1,15 | — | — |
| Vitesse (×) | 0,92 | 1,0 | 0,9 | 1,0 | 1,05 | — |
Vie 100 ; régénération après 4 s sans dégât, 25 PV/s. Dotation : principale au choix + pistolet + couteau + 1 grenade.
Recul : une partie va dans la visée (le tangage de `game.camPitch` monte et le joueur compense), l'autre est un
ressort visuel (raideur 420, amortissement 5,5 : le ressort de LA CAGE `hoopfx.js:10-13`). Tirages (dispersion, recul
horizontal) par `partie.rng`.

### 5.8 Vue FPS, caméra orbitale, viewmodel, modèles d'armes (L-B)

```js
// vue_fps.js
export class VueFPS {
  constructor(game)
  entrer(acteur) / sortir()   // corps local caché (joueur.mesh.visible = false à chaque image, vuePremiere = false), champ, pointeur
  poser(dt, poser = false)    // position = posAff + hauteurOeil (+ balancement ∝ speedNow, nul en visée) ;
                              // rotation : camera.rotation.set(-(tangage + reculV), lacet + reculH, 0, 'YXZ')
  impulsion(dTangage, dLacet) // recul visuel (ressort)
  secousse(amp, dur)          // explosion, coup reçu (en ANGLES, pas en position)
  get champ()                 // vertical, depuis graphics.fov (horizontal) et l'aspect, × zoom de l'arme en visée (lissé)
  capturer()                  // requestPointerLock({ unadjustedMovement: true }) avec repli ; refus de Chrome < 1 s après Échap → aide « clique pour reprendre »
}
// camera_orbite.js
export class CameraOrbite { constructor(game); viser(cible /* acteur | {x,y,z} */, { distance = 2.4, hauteur = 1.2 }); poser(dt, poser = false) }
                              // lacet/tangage de la souris, tangage −0,3..1,2, collision par C.rayonLibre(r 0,2), lissage damp(12)
// viewmodel.js
export class Viewmodel {
  constructor(game)           // scène + PerspectiveCamera(54°, near 0,01) à elle, environment = celui de la scène de jeu
  async preparer()            // bras coupés dans haythem.glb (banc/bras_fps.js : 5 083 triangles), armes, programmes compilés
  montrer(idArme) / cacher()
  maj(dt, { visee, tir, recharge, sprint, vitesse, reculV, reculH })   // balancement, piston du recul, passage hanche → œil
}
// modeles_armes.js
export function creerArme(id, { pourVue = false } = {}) → THREE.Group   // userData.reperes = { crosse, poignee, gardeMain, bouche }
```
**Convention de rotation, à vérifier par test** : avec `rotation.set(-tangage, lacet, 0, 'YXZ')`, l'avant de la caméra
est `(−sin lacet · cos tangage, −sin tangage, −cos lacet · cos tangage)`. Le `lookAt` de la vue 1 (`game.js:1025` :
`camPos − (sin lacet · 3, sin tangage · 3,2, cos lacet · 3)`) a le MÊME lacet et le même sens du tangage (sa
composante verticale n'est qu'approchée : pas de `cos tangage` sur l'horizontale). Le test compare donc le lacet à
0,1° près et le signe du tangage. (La carte du cœur écrit `lacet + π` : c'est faux, ce test le dira.) Le corps :
`setFacing(−sin lacet, −cos lacet)`.
**Le viewmodel** est dessiné par la superposition de `fx` (§ 4.5) : il passe dans le bloom et l'étalonnage, jamais
dans l'occlusion des murs ni dans la mesure d'exposition ; ses matériaux sont compilés pour SA scène (son nombre de
lumières à elle : une hémisphère + une directionnelle, réglées une fois) ; ≤ 6 appels de dessin ; pas d'ombre, pas
`dynamique`. Les reflets (miroirs des toilettes, de l'accueil) ne montrent pas le joueur en FPS : accepté.

### 5.9 Corps des acteurs (L-C)

```js
// avatars.js
export const FICHES_BOTS = [ /* gabriel, imad, marcantoine (gabarit A), koji, djafar (B), ethan (C) — js/roster.js de LA CAGE */ ];
export async function preparerAvatars(game, ids, progres)  // un avatar par gabarit d'abord ; chargeur discret ; attend programmes + clips
export function creerCorps(fiche, scene, equipe) → Player  // url assets/tel/<id>.glb (même sur PC), capFixe, sansRangs, audible = false, sansSouffle
export function libererCorps(player)                       // player.dispose()
// teintes.js
export function teinteEquipe(player, equipe)               // tenue (avaturn_look) teintée à 35 % + brassard enfant de l'os d'épaule
// pose_arme.js
export function poserArme(acteur, dt)                      // buste réparti Spine/Spine1/Spine2, ikBras des deux mains, arme 3e personne (racine de scène, dynamique)
// accroupi.js
export function accroupir(player, k, bas = 0.42)
// poupee.js
export class Poupee { constructor(player, impulsion, point, collisions); pas(dt); poser(); get calme() }
// visibilite_acteurs.js
export class CadenceActeurs { maj(acteurs, camera, imageN) }   // zoneDe(x, −z, y + 1) & zonesCachees(cam) ; cadre (sphère 1 m) ; cadence ; castShadow = même niveau
```
`Player.apresPose = (p, dt) => { accroupir(p, acteur.accroupi); poserArme(acteur, dt); }` (pose posée UNE fois par
image : `AvatarRig.ajouter` est relatif, deux appels sans clip entre eux vissent le buste — piège 1 de carte_persos,
évité par construction). `cibleRegard = null` arme levée.

### 5.10 Navigation, pilotage, cerveau, apparitions (L-D)

```js
// nav.js
export const BORNES_NAV = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };        // la rue bornée : 8 956 nœuds au lieu de 13 875
export class Nav {
  static async obtenir(game, { pas = 0.25, rayon = 0.3, bornes = BORNES_NAV, progres })   // cache, sinon génération (§ 7)
  nb; px; pz; ph;             // Float32Array ; zone (Uint8Array, index des 47 zones) ; niveau (Int8Array : −1, 0, 1, 2 ; 3 = rue)
  debut; liens; cout;         // CSR : Int32Array, Int32Array, Float32Array
  noeudPres(x, y, z, rayonMax = 1.5) → id | -1
  chemin(de, a, out) → bool                 // A* d'un bloc (outils, tests)
  demander(cle, de, a, rappel)              // A* FRACTIONNABLE en file : 1 calcul par pas, 1 500 nœuds ouverts par tranche
  pasFile()                                  // appelé par Partie.pas (§ 3.2 étape 8)
  champDepuis(id) → Float32Array            // Dijkstra complet (15 ms), mis en cache par point d'apparition
  aleatoireDans(zone, rng) → id ; couverts(x, y, z, menaces, rng, n) → [id]   // nœuds hors de vue des menaces (balistique.vue)
  empreinte                                  // string
}
// pilotage.js
export class Pilote { constructor(acteur, nav, balistique); allerA(x, y, z, { sprint, arret = 0.3, marge = 0.3 }); stop(); pas(dt, cmd); get arrive(); get coince() }
// cerveau.js
export const DIFFICULTES = { recrue, regulier, veteran };                 // § 5.10.1
export class Cerveau { constructor(acteur, partie, diff); commande(dt, cmd); entendre(evt); get etat(); get cible() }
// apparitions.js
export const POINTS_APPARITION = [ /* 20 points de carte_monde § 8, par ZONE ('hall', 'e2couloir', …) + point indicatif */ ];
export function choisirApparition(partie, acteur) → { x, y, z, lacet }
```
**Pilotage** (repris de LA CAGE) : `moveTo` avec hystérésis d'arrivée (`ai.js:88-101`) ; cap = la COMMANDE (le
cerveau vise, le pilote donne l'axe relatif au lacet : un bot qui vise court en pas chassés) ; « tirer la ficelle »
par BALAYAGE `C.deplacer` jusqu'à 12 nœuds plus loin, toutes les 0,25 s (100/100 arrivées mesurées ; avec des
`libre()` échantillonnés : 6/60 bloqués — à ne pas faire) ; évitement des autres acteurs à 0,5 m ; coincé = moins de
0,6 m en 3 s → replanification, lien pénalisé ×10 pendant 10 s ; au 2e coincement, téléportation au dernier nœud sûr
SEULEMENT hors de la vue du joueur local (compté par le harnais).
**Cerveau FPS** (états) : `patrouille` (zone tirée au sort, pondérée par les champs de distance et l'absence d'alliés)
→ `chasse` (dernière position vue ou entendue) → `combat` (vue : pas chassés, visée qui converge, rafales, s'accroupit
parfois) → `couvert` (recharge, vie < 40 : nœud hors de vue de la menace à moins de 8 m, `nav.couverts`) → `fuite`.
Perception à 10 Hz : ennemis à < 40 m, cône, `balistique.vue` vers la tête simulée ; ouïe : événements `tir`
(25 m, 10 m à travers un plancher), `pas` en sprint (8 m). Jamais de lecture d'un état que le joueur ne « montre » pas
(pas de triche à travers les murs).

#### 5.10.1 Les difficultés (on ne ralentit JAMAIS un bot : ça se voit — LA CAGE, piège 14)

| | Recrue | Régulier | Vétéran |
|---|---|---|---|
| Réaction (s) | 0,65 | 0,42 | 0,26 |
| Erreur de visée de départ (°) | 7 | 4,5 | 2,8 |
| Convergence (s pour diviser l'erreur par 2) | 0,5 | 0,35 | 0,22 |
| Rafale (coups) | 3-5 | 4-7 | 5-9 |
| Vise la tête (%) | 5 | 12 | 22 |
| Cône de vue (°) / ouïe (m) | 100 / 15 | 110 / 22 | 120 / 28 |

### 5.11 Règles FPS et stand (L-E)

```js
export class PartieFPS extends Partie {   // opts.mode : 'melee' (chacun pour soi) | 'equipes'
  // decompte 3 s → manche (8 min ou 20 éliminations ; équipes : 10 min ou 40) → fin
  // réapparition 3 s par choisirApparition (le plus loin du plus proche ennemi À PIED, vu de personne) ; protection 1,5 s
  // score : élimination 100, tête +50, aide 50 ; régénération § 5.7.1 ; suicide (grenade) −1
}
export class PartieStand extends Partie {  // cibles = mannequins (acteurs sans cerveau) qui se lèvent ; chrono ; records localStorage 'iris.stand.v1'
}
```
Équipes : A dans la rue/porche, B au 2e (e2couloir/e2s1, 41-51 m à pied) ou au −1 (salleSS/pauseSS, 35-48 m) ; jamais
deux équipes sur le plateau du RDC (hall, attente, hall ouest se voient : carte_monde § 8).
Effectifs par défaut : PC mêlée 1 + 7 bots, équipes 4 contre 4 ; téléphone mêlée 1 + 3, équipes 2 contre 2.

### 5.12 Prop hunt (L-F)

```js
export class PartieProp extends Partie {  // profil 'prop' pour les props, 'combat' pour les chasseurs
  // deux manches, camps échangés ; cachette 30 s (chasseurs dans la rue, porte 6 fermée, écran noir + compte à rebours)
  // → traque 3 min 30 → fin ; sifflet forcé de chaque prop toutes les 30 s (15 s la dernière minute)
  // chasseur : −5 PV par tir qui touche le DÉCOR, +5 par touche sur un prop ; à 0 PV il meurt
  // prop : PV = 100 × clamp(volume / 0,25 m³, 0,4, 1,5) ; éliminé = spectateur
}
// deguisements.js
export async function preparerCatalogue(game, progres) → Map<cle, { proto, taille, rayon, hauteur, tri, mats }>
export function deguiser(partie, acteur, cle)     // racine de scène, dynamique, matériaux du décor PARTAGÉS (jamais modifiés), avatar caché par drapeau, rayon de collision
export function meubleVise(partie, acteur) → cle | null   // ce que le prop regarde, à < 3 m (sièges, poses du catalogue)
// cerveau_prop.js
export class CerveauProp { … }       // choisit un meuble de la pièce (rayon ≤ 0,35), une cachette (poses du même type, nœuds peu dégagés), se fige, fuit vu de près
export class CerveauChasseur { … }   // patrouille ; SOUPÇON = meuble hors des poses connues de son type (> 0,4 m), vu bouger, sifflet entendu ; tire au-delà d'un seuil (difficulté)
```
Catalogue phase 1 : extraction par boîte (carte_props § 3.2 et § 8.1 : boîtes de référence, liste de matériaux exclus,
contrôle de taille ± 10 % — un type qui dérive est retiré du jeu plutôt que de donner un meuble faux), fait dans
`preparer()` (≈ 0,5 s pour 20 types). Les sièges (`game.siegesTous`, 346) donnent les poses des chaises. Caméra du
prop : `CameraOrbite` (pas la caméra V2, trop liée au corps de Haythem et à l'os `Head`). Phase 2 (vague 3) : le
registre `noterMeuble` (carte_props § 3.3) — il touche 12 fichiers de carte, donc après la retouche de la vidéo.

### 5.13 HUD, tableau, menus (L-G)

```js
export class HudJeu   { constructor(game); montrer(partie); cacher(); maj(dt, etat) }   // DOM créé sous #hud (pas d'index.html)
export class HudProp  { … }
export class TableauScores { constructor(game); maj(partie, montre) }                  // non interactif, PAS dans RACINES
export class MenuJeu {
  constructor(game, deps)
  accueil()            // BALADE · COMBAT · PROP HUNT · STAND DE TIR · OPTIONS · CRÉDITS — racine manette 'menu-jeu'
  reglage(mode)        // bots, difficulté, durée, avatars (portraits de LA CAGE portraits.js:106), LANCER
  preparation(f, txt)  // l'écran « PRÉPARATION DE LA PARTIE » (barre), pendant Partie.preparer
  fin(resultat)        // REJOUER · MENU · BALADE — racine 'fin-jeu'
}
```
L'état du HUD (`partie.hud`, rempli par les règles) : `{ vie, vieMax, arme, chargeur, reserve, dispersionPx, visee,
recharge, grenades, chrono, scores: [{ id, nom, equipe, elims, morts, score }], phase, phaseT, annonce, propsRestants,
siffletT, deguisement }`. Règle de `HUD.stamina` (ui.js:293-296) : le DOM n'est touché que si la valeur AFFICHÉE
change. En partie, `body.combat` cache `.stamina`, `#hud-keys`, `#phone-badge` (css/jeu/hud.css). L'onglet Commandes
(ui.js:165-175) reçoit trois sous-onglets BALADE / COMBAT / PROP HUNT ; `listen()` (ui.js:234) capture aussi
`mousedown` (pour lier CLIC G / CLIC D). Écran CRÉDITS : celui de LA CAGE (`index.html:319-365`) sans le basket, avec
les avatars des amis (Avaturn) — la licence CC BY 4.0 des danses l'exige déjà.

### 5.14 Effets et sons (L-H)

```js
export class Effets {
  constructor(game)          // pools créés et COMPILÉS dans Partie.preparer : impacts 256 (téléphone 96), traceurs 32 (16),
                             // douilles 64 (24), éclairs 8, étincelles 128 — un InstancedMesh chacun, racine, dynamique, frustumCulled = false
  brancher(partie)           // abonnements : tir, impact, touche, elim, explosion
  maj(dt)
}
export class SonsJeu { constructor(audio); brancher(partie); maj(dt, camera) }
```
Impacts : quads alignés sur la normale de `balle()`, posés seulement sur murs et plafonds (formes `y1 − y0 > 1,8` ou
`joueur === false`), une gerbe d'étincelles ailleurs (les formes des meubles sont grossières : un décalque flotterait).
Éclair : deux quads croisés additifs `toneMapped: false` (le bloom les fait briller) — PAS de lumière (§ 15, R6).
`fx.flash` (fx.js:647, 2017) pour un coup reçu fort ; vignette rouge de dégâts en CSS (HUD).
`audio.js` (L-H) : `PannerNode` (`equalpower`, moins cher que HRTF) par voix, orientation de l'auditeur posée à chaque
image, 24 voix au plus (la plus lointaine volée), bruits blancs et roses PRÉCALCULÉS une fois (`_noise` alloue un
tampon par appel : une rafale de 12 coups/s et 7 tireurs = des déchets à chaque image), atténuation et passe-bas d'un
niveau à l'autre. Tirs synthétisés (salve de bruit + coup sourd + queue dans la réverbération `salle()`), tirs
lointains filtrés ; `whistle`, `buzzer`, `refus` de LA CAGE (`audio.js:178-234`).

### 5.15 Tactile, manette, assistance (L-I)

- `touch.js` : `_contexte()` (l. 224-238) en partie — FPS : TIR (xl, rôle mixte bouton + regard : on vise en glissant
  sur le bouton), VISER, SAUT, ACCROUPI, RECHARGER, ARME, GRENADE, SCORES, PAUSE ; prop : DÉGUISER, FIGER, PROVOQUER,
  SAUT ; nouveaux emplacements dans `EMPL` (l. 34-37), `NOMS` (l. 43), `NOM_ACTION` (l. 45), places par défaut dans
  `disposer()` (l. 140-146) ; bornes du tangage par `game.bornesTangage()` (l. 422) ; tir automatique (réglage, défaut
  au téléphone) : l'assistance dit « un ennemi sous le réticule » → `cmd.tir = true`.
- `manette.js` : bornes (l. 338) par `game.bornesTangage()` ; vibrations `tir` faible 40 ms, `touche reçue` forte
  120 ms par `game.input.manette.vibrer(f, l, ms)` (l. 376), sur ÉVÉNEMENTS ; la liste en dur du bloc manette de
  l'onglet Commandes est à L-G (ui.js:45-57).
- `assistance_visee.js` : `corriger(cmd, game, dt)` — à la manette et au doigt seulement : ralentissement ×0,5 quand
  le réticule est à < 3° d'une capsule ennemie visible, aimantation douce (≤ 30 % du mouvement de la cible) ; jamais
  à la souris.

### 5.16 Le monde en partie (L-M)

```js
// monde_partie.js
export const TABLE_PORTES = { /* nom de porte → 'ouverte' | 'fermee' | 'sas' */ };
export function modePartie(carte, { table = TABLE_PORTES, ascenseur = false })   // fige les portes, coupe l'ascenseur
export function restaurer(carte)                                                 // l'état exact de la balade
export function verrouiller(carte, nom, ferme)                                   // la porte 6 du prop hunt
```
| Porte (ecole_portes.js, carte_monde § 4) | En partie | Pourquoi |
|---|---|---|
| entrée n° 6 (15,13 ; −0,8) | ouverte (prop hunt : fermée pendant la cachette) | le sas des chasseurs |
| passage (3,58 ; −4,05) | ouverte | axe principal rue ↔ hall ouest |
| coupe-feu du 2e (14,75 ; −7,9) | ouverte | SEUL accès au 2e (12 trajets sur 36 bloqués là) |
| salles 1 et 2 du 2e, David Clark, hall −1 → pause, S −1.14, Si 0.1, bureau B | ouvertes | pièces de jeu |
| service (hall), la grise vers le −1 | ouverte | 2e accès au −1 (volée de tôle) |
| toilettes F/H, PMR, local C01, service (passage) | fermées (des murs) | culs-de-sac à camper ; pièces « FERMEES » de la visibilité |

Mise en œuvre dans `ecole_portes.js` : `forcer(P, k)` pose `P.k`, les vantaux et `forme.off` ; `maj` (l. 580-609)
saute une porte forcée. Ascenseur : `majAscenseur` (ecole_ascenseur.js:456) ne fait rien si `jeu.partie`, formes de
passage allumées. Visibilité : une pièce de `FERMEES` (ecole_visibilite.js:392-398, 329-335) dont une porte est forcée
OUVERTE devient `toujours` (sinon, vue de plus de 8 m par la porte ouverte, elle serait coupée) — coût mesuré par
le test. `carte_ecole.js:628` (le « jour » de l'escalier) : `balle: false`. `ecole_etage1.js:1046` : `ch.siegesTous =
tous` et `carte.siegesTous` dans le retour (carte_ecole.js:2465-2475). `Portes._formePorte` (l. 561) : `vitre: true`
pour les modèles vitrés. Le graphe de navigation est généré APRÈS `modePartie` (son empreinte contient la table).

### 5.17 `index.js` (S0)

```js
export const MODES = { essai: PartieEssai, melee: PartieFPS, equipes: PartieFPS, prophunt: PartieProp, stand: PartieStand };
export function installerJeu(game, deps) → { demarrer(), lancer(mode, opts), quitter(), menu }
```
`demarrer()` lit `?partie=`, `?graine=`, `?bots=`, `?diff=`, `?test=1` ; sinon `settings.game.demarrage`.

---------------------------------------------------------------------------------------------------------------------

## 6. LES LOTS

### 6.1 Ordre

```
VAGUE 0   S0  SOCLE ............................................. 1 agent, ≈ 1,5 j, sur master → branche socle
VAGUE 1   (tous partent du commit du socle, en parallèle, chacun dans son arbre)
          L-A ARMES & BALISTIQUE   L-B VUE & MOUVEMENT   L-C CORPS        L-D NAV & IA        L-E RÈGLES FPS
          L-F PROP HUNT            L-G HUD & MENUS        L-H EFFETS & SONS L-I TACTILE & MANETTE  L-M MONDE (après R)
VAGUE 2   INTÉGRATION ................................................ 1 agent, ≈ 2 j
VAGUE 3   (plus tard) registre des meubles · réseau LAN · hôte autoritaire
EN PARALLÈLE   R  RETOUCHE DE LA VIDÉO (la partie de l'école mal faite) — ses fichiers de carte à elle
```
Fusion dans `integration` : S0 → L-M (une fois R fusionné) → L-A → L-B → L-C → L-D → L-H → L-E → L-F → L-G → L-I. Les
listes de fichiers sont disjointes : aucune fusion n'a de conflit, l'ordre ne sert qu'à faire tourner les tests du
lot fusionné sur une base qui a déjà ses dépendances réelles.

### 6.2 Qui possède quel fichier EXISTANT

| Fichier | Socle (S0) | Ensuite |
|---|---|---|
| js/game.js, js/input.js, js/settings.js, js/main.js, js/chargement.js, index.html | prises § 4 | INTÉGRATION seulement |
| js/player.js, js/couches.js, js/avatar.js, assets/anims/manifest.json, assets/tel/*.glb, assets/<ami>.glb | player/couches : § 4.2 | L-C |
| js/fx.js | superpositions § 4.5 | L-H |
| js/audio.js | — | L-H |
| js/ui.js | — | L-G |
| js/touch.js, js/manette.js | — | L-I |
| js/manette_menus.js | `ajouterRacine` | L-I |
| js/ecole_portes.js, js/ecole_visibilite.js, js/ecole_ascenseur.js, js/carte_ecole.js (l. 628, 2465-2475), js/ecole_etage1.js (l. 1046) | — | L-M (après R, § 6.4) |
| js/collisions.js, js/demarrage.js, css/style.css | — | personne (lus, pas écrits) |
| sw.js, assets/chargement.json, tools/liste_chargement.py, tools/chargement_releves.json, README.md, CREDITS.md, Lancer.bat | — | INTÉGRATION |

### 6.3 Les lots, en détail

| Lot | Fichiers (neufs sauf mention) | Port | Dépend (contrats du socle) | Fini quand (§ 12) | Taille |
|---|---|---|---|---|---|
| S0 SOCLE | § 4 + `js/jeu/{index,constantes,rng,commande,acteur,partie,partie_essai,harnais}.js`, stubs de tous les autres, `tests/test_socle.js`, `css/jeu/*.css` vides, `tools/proprietaires.json`, `tools/verifier_proprietaires.py` | 8130 | — | test_socle | ≈ 700 l. |
| L-A ARMES | armes.js, balistique.js, touches.js, grenade.js, tests/test_armes.js | 8131 | partie, acteur, collisions | test_armes | ≈ 750 l., 2 j |
| L-B VUE | mouvement.js, entrees_jeu.js, vue_fps.js, camera_orbite.js, viewmodel.js, modeles_armes.js, tests/test_vue.js | 8132 | partie, acteur, fx.superpositions | test_vue | ≈ 900 l., 2,5 j |
| L-C CORPS | avatars.js, teintes.js, pose_arme.js, accroupi.js, poupee.js, visibilite_acteurs.js, tests/test_corps.js + player.js, couches.js, avatar.js, manifest, avatars copiés | 8133 | acteur, modeles_armes (stub) | test_corps | ≈ 800 l., 2 j |
| L-D NAV & IA | nav.js, nav_cache.js, pilotage.js, cerveau.js, apparitions.js, tests/test_nav.js | 8134 | balistique (stub), acteur | test_nav | ≈ 1 200 l., 3-4 j |
| L-E RÈGLES FPS | partie_fps.js, partie_stand.js, tests/test_fps.js | 8135 | tout (stubs) | test_fps | ≈ 600 l., 1,5 j |
| L-F PROP HUNT | partie_prop.js, deguisements.js, cerveau_prop.js, tests/test_prop.js | 8136 | camera_orbite (stub), nav (stub) | test_prop | ≈ 900 l., 2,5 j |
| L-G HUD & MENUS | hud_fps.js, hud_prop.js, tableau_scores.js, menus_jeu.js, css/jeu/hud.css, css/jeu/menus.css, tests/test_hud.js + ui.js | 8137 | partie.hud, événements | test_hud | ≈ 900 l. + 400 CSS, 2 j |
| L-H EFFETS & SONS | effets.js, sons_jeu.js, tests/test_effets.js + audio.js, fx.js | 8138 | événements | test_effets | ≈ 700 l., 2 j |
| L-I MOBILE | assistance_visee.js, css/jeu/tactile.css, tests/test_mobile.js + touch.js, manette.js, manette_menus.js | 8139 | entrees_jeu (stub), touches (stub) | test_mobile | ≈ 450 l., 1,5 j |
| L-M MONDE | monde_partie.js, tests/test_monde.js + les 5 fichiers de carte (§ 5.16) | 8140 | — | test_monde | ≈ 150 l., 0,5 j |
| INTÉGRATION | sw.js (`VERSION = 'iris-v3.0'`), relevé de chargement, astuces (chargement.js:465-476), sous-titre (index.html:128 « L'ÉCOLE · BALADE · COMBAT · PROP HUNT »), README, CREDITS, réglages fins, tous les tests, ?tel=1 | 8124 | tout | § 12.6 | 2 j |

Un lot qui a besoin d'une chose d'un autre lot avant sa fusion code contre le STUB (il marche) et écrit dans son test
ce qu'il attend du vrai ; l'intégration rejoue ce test sur la base réelle.

### 6.4 La retouche de la vidéo (lot R) et la carte

La demande de Haythem commence par « arrange une partie de l'établissement qui a été mal faite » (sa vidéo du 15/10).
Ce lot n'est pas de ce rapport, mais il partage la carte :
- R possède les fichiers de la zone retouchée ; L-M ne commence qu'une fois R fusionné (ou, s'il presse, ne touche que
  les lignes de § 5.16 : `ecole_portes.js` `maj`/`forcer`, `ecole_visibilite.js:392-398` et 329-335,
  `ecole_ascenseur.js:456`, `carte_ecole.js:628` et 2465-2475, `ecole_etage1.js:1046` — une fusion de quelques lignes
  si R les touche aussi).
- Rien du gameplay ne dépend de coordonnées en dur : apparitions par ZONE (point indicatif ramené au nœud le plus
  proche), cachettes par sièges et poses, graphe régénéré quand l'empreinte du monde change (§ 7.3). Après R :
  `__jeu.verifierNav()` et `__jeu.verifierBots()` sont rejoués par l'intégration.
- Une pièce nouvelle ou modifiée doit garder les invariants du monde solide (dalles sous tout ce qu'on foule, piège 5
  de carte_monde) : sinon les bots tombent d'un niveau — `verifierBots` le compte (`sousLeSol`).

---------------------------------------------------------------------------------------------------------------------

## 7. LA NAVIGATION

### 7.1 Décision : générée au lancement, gardée en cache

| Option | Pour | Contre | Choix |
|---|---|---|---|
| Fichier précalculé `assets/nav.bin` (~540 Ko, ~350 Ko rue bornée) | 0 s au téléphone | faux dès qu'on retouche la carte (la vidéo !) ; à regénérer à la main ; sw.js, liste de chargement | non |
| Génération à chaque partie | toujours juste | 0,7 s PC, plusieurs secondes au téléphone, à chaque lancement | non |
| **Génération à la 1re partie + IndexedDB sous empreinte** | juste, rapide ensuite (lecture ≈ 30 ms), rien dans sw.js | 1re fois 0,7 s (PC) sous l'écran de préparation | **oui** |
| Génération dans un Worker | pas de gel | un worker de module ne voit pas l'importmap (`collisions.js` importe `three`) : il faudrait dupliquer la physique — risque de dérive | non (plus tard si le téléphone l'exige) |

### 7.2 La méthode (prototype de carte_monde § 7, mesuré)

Pas 0,25 m, rayon 0,3 ; représentant d'une case = centre poussé hors des formes par `C.resoudre`, gardé s'il reste
dans la case et `libre` ; un lien vers chacune des 8 voisines si `C.deplacer` y mène à 3 cm près ; sols par `solEn`
(rampes continues ; un nœud par case ET par sol, clé (case, hauteur au demi-mètre)) ; descente de plus de 0,6 m = pas
de lien ; remplissage DEPUIS DES GRAINES (le départ et les 20 points d'apparition) — sinon on navigue dehors,
derrière les mitoyens (carte_cage : 16 653 nœuds dehors). Bornes `BORNES_NAV` → **8 956 nœuds, 60 146 liens, une
composante**. Cabine d'ascenseur exclue (plan x > 17,95, y 7,7-9,05). Chaque nœud : sa zone (`lumieres.zoneEn(x, z,
h + 0,1)`, 47 zones) et son niveau. Stockage : `Float32Array` × 3 + CSR (≈ 0,6 Mo). Distances de Dijkstra en
`Float64Array` (en `Float32Array`, la file paresseuse s'arrête à 1 700 nœuds : piège rencontré).
Mesures : génération 0,69 s (PC, 13 875 nœuds) ; A* 2,7 ms en moyenne, 13,5 ms au pire → **A* fractionnable** (1 500
nœuds ouverts par tranche ≈ 1,5 ms, une tranche par pas) ; Dijkstra complet 15 ms (champs des 20 apparitions : 0,3 s,
mis en cache avec le graphe). Rangs serrés : laissés hors du graphe des bots (rayon 0,3 : pleins) ; les petits props
(rayon 0,2) ont un second graphe facultatif (15 866 nœuds, 0,97 s) — seulement si un bot prop en a besoin.

### 7.3 L'empreinte (le cache ne ment jamais)

`empreinte = hacher([C.formes.length, C.sols.length, C.plafonds.length, Σ arrondi(coordonnées), table des portes,
pas, rayon, bornes, VERSION_NAV])`. Changer une cote de la carte, la table des portes ou l'algorithme = nouvelle
clé = régénération. `?nav=refaire` force. `__jeu.verifierNav()` rend les chiffres (§ 12).

---------------------------------------------------------------------------------------------------------------------

## 8. LES RAYONS DES BALLES ET DE LA VUE

| Méthode | Coût mesuré | Justesse | Choix |
|---|---|---|---|
| `THREE.Raycaster` sur la scène (650 000 tri. opaques, 1 345 maillages, sans BVH) | 18-40 ms / rayon | exacte (sauf rien) | interdit |
| `Octree` de `three/addons/math/Octree.js` (présent dans vendor) sur le décor cousu | construction de plusieurs secondes et mémoire sur 700 k tri., rayons rapides | exacte mais ne connaît pas les formes (meubles, vitres) | non |
| `three-mesh-bvh` (MIT, à mettre dans vendor/) | ~0,05 ms / rayon après un BVH au chargement | exacte, normales justes | plus tard, si les impacts « flottent » trop |
| `C.rayonLibre` (rectangle englobant du segment) | 12-106 µs (2-40 m) ; 0,18 ms à 40 m en diagonale | 0 bloqué à tort / 300, 5 libres à tort (feuillage, Haythem) ; ignore sols, `camera:false` | stub du socle seulement |
| **DDA de la grille de 2 m + 53 sols + capsules** | **7,9 µs** (vue) ; balle ≤ 30 µs visé | celle des formes (les meubles sont grossiers : impacts sur murs et plafonds seulement) | **oui** |

Contrôle de justesse (L-A) : 100 rayons comparés au `Raycaster` (une fois, 2 s, dans le test) : ≥ 97 % d'accord hors
feuillage ; rayons verticaux du § 6 de carte_monde : 100 % arrêtés aux sols du 1er, du −1 et de la rue.

---------------------------------------------------------------------------------------------------------------------

## 9. LA PERFORMANCE

### 9.1 Les mesures de départ (rappel)

Radeon 660M intégrée, 1,27 Mpx, autres onglets ouverts (pessimiste) : décor HAUTE 880 appels (départ), 1 080 (hall
ouest), 1 710 (rue), 150-340 (−1) ; MOYENNE 490 / 600 / 950 / 80-190 ; ≈ 25-45 µs de processeur par appel : **le jeu
est limité par les appels**. Avatar : +12 appels, +63 k tri. en haute. Meuble extrait 3 matériaux : +12 (haute) / +9
(moyenne). 300 impacts en InstancedMesh : +1 appel. Bot simulé : ≈ 15 µs par pas ; posé : 0,12-0,15 ms par image.

### 9.2 Le budget de ce qu'on ajoute

| | PC (moyenne/haute) | Téléphone (`?tel=1`) |
|---|---|---|
| Joueurs par défaut | mêlée 8, équipes 4 v 4, prop hunt 3 + 3 | mêlée 4, équipes 2 v 2, prop hunt 2 + 2 |
| Maximum réglable | 12 (avertissement au-delà de 8) | 6 |
| Avatars distincts | 6 (`assets/tel/`, ≈ 136 Mo) | 3 (≈ 70 Mo) |
| Bots posés chaque image | ceux à l'écran à < 18 m (4-6 typiques) | 2 ; les autres 1 image sur 3 (table `AVATARS_PLEINS` de LA CAGE presence.js:76) |
| Appels ajoutés, typique / pire | ≈ 50 / ≤ 150 (7 bots à l'écran : 84 + viewmodel 6 + effets 6 + props) | ≈ 30 / ≤ 80 |
| Pools d'effets | impacts 256, traceurs 32, douilles 64, éclairs 8, étincelles 128 | 96, 16, 24, 4, 48 |
| Processeur du gameplay (sim + poses + IA + balles + HUD) | ≤ 2,5 ms par image (sim 0,2 · poses 0,6-1,1 · cerveaux 0,3 · A* 0,2 en moyenne · balles 0,2 · HUD/effets 0,3) | ≤ 3 ms |
| Qualité conseillée en combat | MOYENNE sur puce intégrée (la haute = +80 % d'appels par les normales du GTAO) ; l'auto reste juge | auto (moyenne) |

Leviers dans l'ordre si ça ne tient pas : (1) moins de bots POSÉS (cadence), (2) ombres des bots coupées hors du
niveau de la caméra (déjà), (3) perception 5 Hz / pensée 15 Hz, (4) moins de bots. `fx.calme = false` pendant une
manche : pas de changement de préréglage en plein échange de tirs (une remontée réalloue toutes les cibles : une
image figée). `BUDGET_IMAGE` (fx.js:454, 45 im/s) n'est PAS touché avant mesure à l'intégration.

### 9.3 Les gels à éviter (mesurés)

| Cause | Gel | Parade |
|---|---|---|
| Une lumière ajoutée / retirée / cachée | 27 s (31 programmes) | aucune lumière en jeu (règle 6) |
| 10 avatars neufs sans précompilation | 4,96 s | `preparerAvatars` sous l'écran de préparation ; programmes des avatars = ceux de Haythem (mêmes matériaux Avaturn) : 11 ms de texture + ≈ 23 ms de 1er rendu par avatar une fois compilés |
| Chargement par `DefaultLoadingManager` < 30 s après la construction | recuisson ombre du sol + carte d'environnement + cache d'ombre | chargeur discret (§ 4.2) |
| Remontée de qualité en combat | une image | `fx.calme` |
| A* de 13,5 ms | une image | A* fractionnable |
| `renderer.info.programs` qui grandit en manche | un gel par programme | test : nombre de programmes constant après `preparer()` (§ 12) |

---------------------------------------------------------------------------------------------------------------------

## 10. LES ENTRÉES

### 10.1 Les profils de touches (codes physiques `e.code` ; libellé AZERTY entre parenthèses)

| Action | BALADE (inchangé) | COMBAT clavier | COMBAT manette | PROP clavier | PROP manette | Tactile |
|---|---|---|---|---|---|---|
| avancer/reculer/gauche/droite | KeyW/S/A/D (Z Q S D) + flèches | idem | stick G | idem | stick G | joystick |
| sprint | Maj ; RT | Maj | **L3** | Maj | L3 | bord du joystick |
| sauter | Espace ; A, X | Espace | A | Espace | A | SAUT |
| tirer | — | CLIC G | RT | — | — | TIR (mixte) / tir auto |
| viser | — | CLIC D | LT | — | — | VISER (bascule) |
| recharger | — | KeyR (R) | X | — | — | RECHARGER |
| arme suivante / précédente | — | MOLETTE ↓ , KeyQ (A) / MOLETTE ↑ | Y | — | — | ARME |
| arme 1 / 2 | — | Digit1 / Digit2 (& / é) | — | — | — | — |
| accroupi | — | **KeyC (C)**, KeyX (X) — jamais Ctrl | B | — | — | ACCROUPI |
| couteau | — | KeyV (V) | R3 | — | — | (glisser bas sur TIR) |
| grenade | — | KeyG (G) | RB | — | — | GRENADE |
| se déguiser / figer / provoquer | — | — | — | KeyE (E) / KeyF (F) / KeyT (T) | X / Y / RB | DÉGUISER / FIGER / PROVOQUER |
| tableau des scores (tenir) | — | Tab | Back | Tab | Back | SCORES |
| pause | Échap ; Start | Échap ; Start | Start | Échap | Start | II |
| vue / téléphone / emotes / s'asseoir / marcher | C, P, T, E, Alt | — | — | — | — | — |

**Jamais Ctrl par défaut** : Ctrl + Z (KeyW) = Ctrl+W, qui ferme l'onglet et que la page ne peut pas empêcher.
Les profils sont des TABLES COMPLÈTES séparées (`controls.combat`, `controls.prop`) : un code ne sert qu'une action
DANS un profil (`_take`, input.js:69-75, le consomme pour le premier lecteur). `Game.appliquerProfil()` appelle
`input.setBindings(settings.bindingsDe(p), settings.padBindingsDe(p))` à l'entrée et à la sortie de partie.

### 10.2 La souris en FPS

Pointeur capturé `unadjustedMovement` (repli sans option), lacet 0,0025 × sensibilité rad/px (2 513 px pour un tour
à 1), × `sensVisee` en visée ; tangage ±1,48 rad (±85°) au lieu de −5,7°/+51,6° ; pas de lissage (la vue 1 met
105 ms à faire 90 % du geste) ; Échap → `pointerlockchange` → pause ; « Reprendre » → la capture est redemandée ; si
Chrome la refuse (dans la seconde qui suit un Échap), la partie RESTE en pause avec « Clique dans l'image pour
reprendre ».

---------------------------------------------------------------------------------------------------------------------

## 11. LE CHARGEMENT ET LE CACHE

- **Démarrage de la balade : inchangé.** Les modules `js/jeu/*.js` sont importés STATIQUEMENT par `main.js` →
  `index.js` : `tools/liste_chargement.py` les compte seul (`graphe_modules`, l. 74 : imports statiques depuis
  `js/main.js`). Coût visé ≤ +0,3 s sur PC au démarrage (≈ 300 Ko de JS en plus) ; mesuré par l'intégration avec
  `?chargement=trace` → `copy(JSON.stringify(__chargement.traceFigee))` → `python tools/liste_chargement.py releve.json`.
- Les tests (`js/jeu/tests/*.js`) sont importés DYNAMIQUEMENT sous `?test=1` : ni dans la liste de chargement, ni
  dans le cache hors ligne.
- **Ce qui se charge au lancement d'une partie** (écran « PRÉPARATION », `Partie.preparer`) : graphe (cache ou
  0,7 s), avatars des bots (1re fois : 150-480 ms chacun, en parallèle, un par gabarit d'abord ; ensuite 28 ms par
  exemplaire), catalogue des déguisements (prop hunt, ≈ 0,5 s), pools d'effets et viewmodel compilés. Visé : 1re
  partie ≤ 4 s PC, ≤ 10 s téléphone ; les suivantes ≤ 1,5 s.
- `sw.js` : les `assets/tel/<ami>.glb` sont « lourds » (cache d'abord, `sw.js:23`) : jouables hors ligne après la
  première partie. `VERSION` passe à `iris-v3.0` à l'INTÉGRATION seulement (index.html, CSS et fichiers lourds ont
  changé ; c'est aussi le numéro affiché à l'écran de chargement). Si des sons en fichiers arrivent un jour :
  ajouter `ogg|mp3|wav|m4a` à la règle des lourds.
- Préchauffage facultatif (intégration) : 20 s après le démarrage, si l'onglet est inactif, `fetch()` des avatars
  choisis dans les réglages (pas par les chargeurs de three : pas de recuisson).

---------------------------------------------------------------------------------------------------------------------

## 12. LE HARNAIS DE TEST (`js/jeu/harnais.js`, `window.__jeu`)

### 12.1 L'API (socle)

```js
__jeu.pret() → Promise                       // le jeu est chargé (menu ou balade)
__jeu.lancer(mode, opts) → Promise<etat>     // mode 'essai'|'melee'|'equipes'|'prophunt'|'stand'|'balade' ; opts { graine, bots, difficulte,
                                             //   avatars, duree, scoreCible, humain = true, campHumain, mannequins: [{x,y,z}] }
__jeu.quitter()
__jeu.etat() ; __jeu.empreinte()             // Partie.etat() ; hacher(etat)
__jeu.acteurs() → [{ id, nom, equipe, x, y, z, zone, niveau, vie, vivant, arme, chargeur, etatCerveau }]
__jeu.teleporter(id, x, y, z, lacet?) ; __jeu.teleporterZone(id, zone)
__jeu.viser(id, cible)                       // acteur id | {x,y,z} | {lacet, tangage}
__jeu.commande(id, partielle, duree)         // force des champs de commande pendant `duree` s (pilote Haythem sans clavier)
__jeu.tirer(id, { n = 1, cible, intervalle }) → { tirs, touches, tetes, decor, elims }
__jeu.avancer(secondes, { rendu = false }) → { ms, pas }   // simulation seule : Partie.pas en boucle, sans image (≈ 2,3 s par minute à 8 bots)
__jeu.images(n) → Promise<{ medMs, p95Ms, appels, triangles, programmes }>   // de vraies images (rAF)
__jeu.compteurs() → { tirs, touches, tetes, elims, impacts, sons, chemins, aStarMs, coinces, teleportsSecours, horsMonde }
__jeu.verifierNav() → { noeuds, liens, composantes, parNiveau, zonesAtteintes, apparitions, ms, cache }
__jeu.verifierBots({ duree = 120, bots = 8 }) → { coinces: [], horsMonde: [], sousLeSol: [], dansUnMur: [], traverseMurs: [], zonesVisitees }
__jeu.verifierDeterminisme(graine, secondes) → { a, b, egal }      // deux parties, mêmes graines → mêmes empreintes
__jeu.verifierEtat() → bool                  // etat() → appliquer() dans une partie neuve → etat() identique
__jeu.verifierEntrees() → { emoteFantome, sautApresPause, clicDeCapture }   // les pièges 1-2 et le clic qui capture
__jeu.memoire() → renderer.info.memory + programmes + enfants de la scène
__jeu.photo(nom) → dataURL                   // capturée dans le rAF juste après le rendu
__jeu.mesurer(fn, n) → { med, p95 }          // micro-chrono
__jeu.ajouterTest(lot, nom, async fn)  ;  __jeu.tests(lot?) → { ok, echecs: [{ nom, attendu, obtenu }], ms }
```
Adresse de test : `http://localhost:81xx/?test=1&partie=essai&graine=42` (démarre sans geste : chargement.js:577) ;
`&rapport=1` lance tous les tests et pose `window.__rapport` (le lot le lit par `javascript_tool`). Les tests ne
cliquent jamais à l'écran : tout passe par `__jeu`.

### 12.2 Ce que chaque lot doit passer (seuils)

| Lot | Tests et seuils |
|---|---|
| S0 | balade bit-identique (§ 12.3) ; `verifierEntrees` : 0 emote fantôme, 0 saut après pause, 0 tir au clic de capture ; 3 cycles lancer/quitter : géométries et textures ±2 %, enfants de la scène identiques ; programmes constants pendant 10 s de manche ; `verifierEtat` vrai ; FPS de la caméra : avant = formule de § 5.8 à 0,1° près |
| L-A | 2 000 rayons entre nœuds : accord `balle()` / référence ; 100 rayons vs Raycaster ≥ 97 % (hors feuillage) ; verticaux : 100 % arrêtés aux sols ; `balle` ≤ 30 µs médian à 30 m, `tirer` à 8 acteurs ≤ 0,1 ms ; mannequin à 10 m, dispersion nulle : 100/100 têtes ; 30 coups en 2,4 s ±1 pas ; recharge 2,1 s ±1 pas ; munitions conservées ; 50 grenades : aucune dans un mur ni sous un sol ; capsule tête simulée / os ≤ 6 cm moyen, ≤ 10 cm p95 |
| L-B | caméra = commande dans la même image (aucun lissage) ; tangage ±1,48 ; 2 513 px / tour à sensibilité 1 ; visée en 0,22 s ±1 image ; viewmodel ≤ 6 appels ; œil 1,62 / 1,08 ; 0 nœud où un saut mettrait l'œil à < 5 cm d'un plafond ou d'un linteau ; `pointerlockchange` simulé → pause ouverte |
| L-C | 6 avatars prêts ≤ 3 s (PC, cache chaud) ; mémoire des textures des bots ≤ 140 Mo ; pose d'arme : canon/cible ≤ 0,5°, mains ≤ 2 cm, ≤ 0,2 ms ; poupée à plat < 1 s, jamais dans un mur, 0 NaN ; bot d'un autre niveau : non dessiné, sans ombre ; 3 cycles : mémoire stable ; balade bit-identique (encore) |
| L-D | `verifierNav` : 8 000-10 000 nœuds, 1 composante, 20/20 apparitions, 4 niveaux ≥ 60 m² chacun, 0 nœud de cabine, génération ≤ 1,0 s PC, cache ≤ 50 ms ; A* 200 paires : médiane ≤ 3 ms, p95 ≤ 8 ms, tranche ≤ 1,5 ms ; `verifierBots(180 s, 8)` : 0 hors monde, 0 sous le sol, 0 dans un mur > 0,2 s, ≤ 1 coincé > 4 s et ≤ 1 téléportation de secours par 10 minutes-bot, 47 zones visitées sur 47 atteignables ; 10 000 `vue()` : 0 vu à travers un mur ; IA de 8 bots ≤ 0,6 ms par image en moyenne, ≤ 3 ms au pire |
| L-E | mêlée 8 bots, 5 min simulées : fin correcte, Σ éliminations = Σ morts − suicides ; 0 apparition à la vue d'un ennemi ; ≤ 2 % de morts < 2 s après l'apparition ; réapparition 3 s ±1 pas ; déterminisme : même graine → même empreinte à 60 s |
| L-F | catalogue ≥ 10 types, tailles ±10 %, ≤ 600 ms ; un prop ≤ 12 appels (haute) ; manche bots seuls (3 + 3, 4 min) : phases dans l'ordre, 0 tir des chasseurs pendant la cachette, tous dans le sas, pénalités appliquées, sifflets à 30 s ±1 pas ; 0 prop dans un mur ; bots props : rayon ≤ 0,35 |
| L-G | ≤ 2 écritures DOM par image en moyenne (MutationObserver, 300 images) ; aucune lecture de mise en page hors `feedback` ; menu parcouru à la manette (nav simulée) bouton par bouton ; tableau montré tant que `scores` est tenu ; textes en français |
| L-H | 1 000 impacts : 1 appel, 0 programme neuf, ≤ 0,2 ms pour 256 actifs ; 100 tirs/s pendant 10 s : ≤ 24 voix, 0 `AudioBuffer` créé par tir ; panneau à la position de la source, auditeur orienté |
| L-I | en partie, boutons présents et sans recouvrement à 3 tailles d'écran (812 × 375, 915 × 412, 1138 × 568) ; doigt simulé sur TIR qui glisse : `camYaw` bouge ET `tir` tenu ; manette : RT = tir, bornes ±1,48, ralentissement ×0,5 près d'une cible ; souris : aucune assistance |
| L-M | table appliquée (formes, vantaux) ; `restaurer` → état de la balade identique (formes `off`, `k`) ; ascenseur inerte en partie ; 6 photos aux portes ouvertes : aucune pièce coupée, ≤ +60 appels ; `siegesTous.length === 346` |

### 12.3 « Balade bit-identique » (le garde-fou de la balade)

Avant le socle, sur `a8b22dd`, un petit script de console (fourni par le socle dans `tests/test_socle.js`, commenté)
rejoue 20 s de commandes clavier fixées (avancer, tourner de 90°, sprint, saut, s'asseoir, se lever) par
`input.presser/relacher` au pas près, `game.time` comme horloge, et note `user.pos`, `user.facing`, `camYaw` toutes
les 0,5 s → `tests/reference_balade.json`. Après chaque lot qui touche `game.js`, `player.js`, `couches.js`, `input.js`
ou `settings.js` : mêmes valeurs à 1e-9 près. (Les poses d'animation peuvent varier : seules les positions
comptent.)

### 12.4 Ce que le harnais compte tout seul

Il s'abonne à `'*'` : tirs, touches, têtes, éliminations, impacts ; il chronomètre `Partie.pas`, `Partie.image`,
`nav.demander` ; il surveille chaque acteur à chaque pas en mode test : `y < −3,6` ou hors `BORNES_NAV` → `horsMonde` ;
`!C.libre(x, z, 0,25, y)` pendant plus de 0,2 s → `dansUnMur` ; segment `posPrec → pos` qui traverse une forme →
`traverseMurs` ; `pos.y` qui baisse de plus de 0,6 m sans saut → `sousLeSol`.

### 12.5 Comment un lot se vérifie

1. `python serve.py 81xx` dans SON arbre ; 2. un onglet sur `/?test=1&rapport=1&lot=<lot>` ; 3. lire
`window.__rapport` ; 4. une ou deux `__jeu.photo()` pour l'œil ; 5. `python -I tools/verifier_proprietaires.py
lot/<lot>` ; 6. onglet et serveur fermés. Les millisecondes de la vague 1 sont relatives (d'autres agents tournent) :
un seuil de temps manqué de moins de 50 % est signalé, pas bloquant ; l'intégration tranche, machine calme.

### 12.6 L'intégration

Tous les tests, sur PC (port 8124, seul onglet) puis `?tel=1` ; trois parties complètes jouées à la main par l'agent
(mêlée, équipes, prop hunt) avec photos ; mesures aux 11 endroits de carte_props § 4.1 en partie (appels, triangles,
ms) ; démarrage de la balade ≤ +0,3 s ; `git status` propre ; `VERSION` ; relevé de chargement ; README (« Comment
jouer », touches, modes) ; CREDITS (avatars des amis, LA CAGE).

---------------------------------------------------------------------------------------------------------------------

## 13. LE MULTIJOUEUR PLUS TARD — ce qui est prêt dès maintenant

### 13.1 Le principe (celui de LA CAGE `js/enligne.js`)

Une seule simulation, celle de l'HÔTE ; les invités envoient leurs commandes (`versTableau(cmd)`, ≤ 30/s,
numérotées `seq`) ; l'hôte les rejoue à leur pas (même `Partie.pas`, l'acteur distant lit une file au lieu
d'`Input`) et renvoie 20 images/s horodatées (`etat()` compact + événements depuis la dernière). L'invité : montre les
autres 80-150 ms dans le passé (`Horloge` + `Tampon` Hermite de `net.js:252-376`, avec `y`), PRÉDIT son propre acteur
avec le même `appliquerCommande` + `Player.move`, corrige en douceur (0,1 s ; d'un coup au-delà de 1,5 m). Les
effets et les sons partent des événements reçus. Pas de « lockstep » : le déterminisme sert aux tests et à la
prédiction, pas à faire tourner deux simulations identiques (les fonctions `Math.sin` peuvent différer d'un
navigateur à l'autre).

### 13.2 L'état (contrat du socle, testé par `verifierEtat`)

```js
{ v: 1, mode, tick, t, rng, phase, phaseT, chrono, scores: { A, B } | null,
  acteurs: [{ id, nom, av, eq, x, y, z, vx, vz, cap, lacet, tangage, jy, jv, air, acc, vie, viv, rT,
              arme: { i, ch: [..], res: [..], et, t, vk }, prop: { cle, rot, fige, pv } | null, st: { e, m, s } }],
  grenades: [{ id, a, x, y, z, vx, vy, vz, t }], evenements: [...] }
```
Les portes figées et le graphe ne voyagent jamais (déterministes, construits par le code) ; le décor non plus.
Taille : ≈ 150 octets JSON par acteur → 10 acteurs ≈ 1,5 Ko × 20/s = 30 Ko/s par invité (le relais accepte 8 192
octets par message et 140 messages/s : `serveur/relais.js` de LA CAGE).

### 13.3 La compensation de latence

L'hôte garde 1 s d'historique de `(x, y, z, cap, acc, jumpY)` par acteur et par pas (120 × 10 × 6 = 7 200 nombres en
anneau) et refait les capsules SIMULÉES (§ 5.7) à l'instant que l'invité voyait (`lag` + retard d'affichage). C'est la
raison de fond des capsules depuis l'état et non depuis les os.

### 13.4 Le LAN

Reprendre de LA CAGE `serveur/relais.js` + `serveur/node.mjs` (sans dépendance, sert le jeu ET le salon sur le même
port ; Node v24.14 est installé) dans `IRIS/serveur/`, port 8124, `Lancer.bat` qui préfère `node` s'il est là et
retombe sur `serve.py` (solo) sinon. `net.js` copié : `SERVEUR_PUBLIC = ''` (pas le salon de LA CAGE : ses paquets
arriveraient chez IRIS), port 8124, clés `iris.*`. Cloudflare plus tard (nouveau worker `iris-salon`, ≈ 2 h de jeu par
jour à 10 joueurs sur le plan gratuit). `serve.py` en WebSocket est possible mais oblige à porter le relais en Python :
deux relais à tenir identiques — non.

---------------------------------------------------------------------------------------------------------------------

## 14. LA BALADE RESTE INTACTE — la liste exacte de ce qui change pour elle

1. Au démarrage, « APPUIE POUR COMMENCER » ouvre le menu (BALADE est le premier bouton, focus manette dessus) ;
   `?partie=balade` ou le réglage `game.demarrage = 'balade'` gardent l'arrivée directe d'aujourd'hui.
2. La pause de la balade gagne un bouton « Modes de jeu ».
3. Les fronts fantômes disparaissent (emote fantôme, saut après la pause) : c'est un correctif.
4. Tout le reste est derrière `if (this.partie)` : vues 1-4, caméra V2, cap assisté, sièges, rangs, emotes,
   téléphone, ascenseur, portes automatiques, sons de pas des couches.
5. `Player.update` = `simuler + poser` dans le même ordre ; contrôlé par « balade bit-identique » (§ 12.3).
6. `quitterPartie()` restaure : profil de touches, portes (`restaurer`), ascenseur, corps de Haythem visible et
   audible, `capFixe`/`rayon` remis, bots détruits (`dispose`), pools d'effets cachés, `placerAuDepart()`.

---------------------------------------------------------------------------------------------------------------------

## 15. LES RISQUES ET COMMENT LES ÉTEINDRE

| # | Risque | Proba. / impact | Détection | Extinction |
|---|---|---|---|---|
| R1 | Deux lots écrivent le même fichier, fusions en conflit | moyenne / fort | `verifier_proprietaires.py` | un propriétaire par fichier (§ 6.2) ; contrats figés ; prises d'abord par le socle |
| R2 | La retouche de la vidéo change la carte sous la navigation | forte / moyen | empreinte du graphe ; `verifierNav`, `verifierBots` après R | graphe régénéré par empreinte ; apparitions par zone ; L-M après R |
| R3 | Régression de la balade par la découpe de `Player.update` | moyenne / fort | balade bit-identique | même ordre d'instructions ; `update` = `annuler + simuler + poser(…, dejaAnnule)` |
| R4 | Coût des bots (poses à 120 Hz : 6 bots = image de 21,8 → 39,8 ms) | forte si rien n'est fait / fort | `__jeu.images` | simuler 120 Hz, poser 1 fois par image, cadence par distance et visibilité |
| R5 | Appels de dessin sur puce intégrée (bots, props, effets) | moyenne / fort | appels aux 11 endroits | `tel/` partout, ≤ 6 avatars, coupe par zones à la main, ombre au niveau de la caméra, pools en InstancedMesh, moyenne conseillée |
| R6 | Une lumière ajoutée (éclair de bouche) | faible (règle) / très fort (27 s) | programmes constants | aucune lumière ; quads additifs + bloom |
| R7 | Programmes compilés en pleine manche (bot, arme, décalque) | moyenne / fort | test « programmes constants » | tout compilé dans `preparer()` ; matériaux Avaturn = programmes de Haythem |
| R8 | Bots bloqués par les portes, l'ascenseur, les rangs, les portes étroites | forte (36 % aujourd'hui) / fort | `verifierBots` | portes figées, ascenseur coupé, `sansRangs`, représentant poussé + balayage, coincé → replanif → secours |
| R9 | Pièces coupées par la visibilité, vues par une porte figée ouverte | moyenne / moyen | photos L-M | `toujours` pour les FERMEES aux portes ouvertes ; culs-de-sac fermés |
| R10 | Balles qui traversent sols, vitres, meubles bas | forte avec `rayonLibre` / fort | tests L-A (verticaux, vitres) | DDA balles : sols + `camera:false` + vitres + `balle:false` |
| R11 | Capsules simulées décalées de la tête affichée (penché en course) | moyenne / moyen | écart ≤ 6 cm / ≤ 10 cm | penché ajouté aux capsules ; sinon penché des couches coupé pour un acteur armé |
| R12 | Échap + pointeur capturé : pause qui ne s'ouvre pas ; recapture refusée | certaine / moyen | test `pointerlockchange` | `iris-pointeur` → pause ; reprise conditionnée à la capture |
| R13 | Fronts fantômes et touches pendant la pause (tirs, grenades fantômes) | certaine (vérifié) / moyen | `verifierEntrees` | purge à la reprise, vieillissement 0,35 s, purge des codes non liés |
| R14 | Ctrl + Z ferme l'onglet | certaine si Ctrl lié / fort | revue des défauts | jamais Ctrl par défaut ; avertissement si Haythem le lie |
| R15 | Convention de caméra fausse (le « + π » de la carte du cœur) | moyenne / moyen | test du socle | formule § 5.8 vérifiée contre la vue 1 |
| R16 | Recuisson de l'ombre du sol par le chargement des bots (< 30 s après construction) | moyenne / faible (une image) | chrono de la préparation | chargeur discret |
| R17 | Mémoire graphique (611 Mo pour 10 avatars PC) et fuites entre parties | moyenne / fort au téléphone | `memoire()` sur 3 cycles | `tel/`, ≤ 6 / ≤ 3 distincts, `Player.dispose` |
| R18 | Sons : déchets mémoire, trop de voix, pas de direction | certaine aujourd'hui / moyen | test L-H | bruits précalculés, 24 voix, `PannerNode`, pas émis par la simulation |
| R19 | Déterminisme cassé (un `Math.random`, des portes dans `carte.maj`) | moyenne / moyen (tests, réseau) | `verifierDeterminisme` | règle 4 ; portes figées ; Rng dans l'état |
| R20 | `_tour` réentrant dans les rayons (collisions faussées sans erreur) | faible / fort | tests L-A | règle 8 ; la balistique tient son propre parcours |
| R21 | Tactile : viser et tirer en même temps est injouable au pouce | forte / fort au téléphone | test L-I + essai | bouton TIR mixte (regard), tir automatique par défaut, assistance |
| R22 | Lenteur du téléphone : génération du graphe 2-4 s, préparation longue | moyenne / moyen | chrono `?tel=1` | cache IndexedDB ; 3 bots ; plus tard un Worker si nécessaire |
| R23 | Visages réels des amis comme cibles d'un FPS | — / humain | — | demander à chacun ; en attendant, Haythem cloné et teinté (0 Mo de plus) ; liste dans le menu |
| R24 | Licences : danses CC BY 4.0 sans crédits en jeu ; GLB de LA CAGE sans licence notée (`bin.glb`, `ball.glb`, `lamp.glb`) | certaine / moyen | revue | écran CRÉDITS (L-G) ; ces GLB ne sont pas repris (les meubles d'IRIS suffisent) |
| R25 | Service worker : un fichier lourd modifié servi périmé | moyenne / faible | chargement | nouvelles URL pour les nouveaux fichiers ; `VERSION` à l'intégration |
| R26 | Le prop qui penche avec les couches, sonne ses pas, garde le rayon de Haythem | certaine si rien / moyen | test L-F | racine à part (posAff/angAff), `audible = false`, `rayon` par acteur |
| R27 | Spirale d'images lentes (6 pas par image × IA lourde) | faible / fort | `Partie.pas` ≤ 0,5 ms | IA à 30/10 Hz décalées, A* en file, dégradation automatique |
| R28 | Agents qui mesurent en même temps (chiffres faux) | certaine / faible | — | ports séparés, seuils de temps non bloquants en vague 1, mesures absolues à l'intégration |

---------------------------------------------------------------------------------------------------------------------

## 16. TAILLE DU TRAVAIL

| | Lignes (ordre de grandeur) | Durée d'un agent |
|---|---|---|
| Socle | ≈ 700 (dont ≈ 350 de contrats et de corps minimaux, ≈ 200 de prises, ≈ 150 de harnais) | 1,5 j |
| Vague 1 (10 lots) | ≈ 7 300 + 600 de CSS | 0,5 à 4 j selon le lot ; ≈ 3-4 j en parallèle |
| Intégration | réglages + documents | 2 j |
| **Jouable en solo (FPS mêlée/équipes, prop hunt, stand, balade)** | **≈ 8 000** | **≈ 7 j de calendrier** |
| Plus tard : registre des meubles | ≈ 150 dans 12 fichiers de carte | 1 j |
| Plus tard : LAN + hôte autoritaire | ≈ 1 000 repris de LA CAGE + ≈ 600 neufs | 5-6 j |

---------------------------------------------------------------------------------------------------------------------

## 17. ANNEXE — LES LIGNES CITÉES (a8b22dd)

`js/game.js` : constantes 35, HAYTHEM 131, constructeur 135-291 (user 215, souris 229-254 : `_onClick` 238, `_onMove`
241-249, tangage 247), `applySettings` 294-305 (`setBindings` 302), `placerAuDepart` 359, `enterLobby` 378,
`updateEmoteInput` 408-424 (garde 410), `togglePause` 432-442, `frame` 444-492 (pause 451, téléphone 452, vue
453-458, pas fixes 459-472, `interpoler` 474, `updateCamera` 475, `carte.maj` 478, `fx.calme` 487, `fx.render` 488,
`endFrame` 489), `addShake` 494, `interpoler` 502-505, `update` 507-554, `updateCamera` 1005 (vue 1 : 1010-1034,
`lookAt` 1025).
`js/player.js` : chargeur 53-62, `prechargerModele` 82, constructeur 141-185, `memoriser` 649, `presenter` 652-668,
`move` 673-724 (rang 682, `deplacer` 704, `faceWant` 721, `turnTo` 723), `_sortirRang` 820 (rayon 826), `turnTo` 831, `setFacing`
856, `faceTo` 862, `jump` 871, `update` 1068-1136, statiques 1150-1159. `js/config.js:13` `RAYON_JOUEUR`.
`js/couches.js` : 124, 186-191, 328. `js/input.js` : constructeur 15-37, `setBindings` 41-49, `_take` 69-75, `endFrame`
77. `js/settings.js` : `ACTIONS` 8-23, `DEFAULTS` 30-57, `load` 88-119, `bind` 134, `keyLabel` 173, `actionKey` 189.
`js/main.js` : 17-22, 33-38, 40-45, 59-65, 79, 83-99 (`commencer` 84). `js/touch.js` : `EMPL` 34-37, `NOMS` 43,
`NOM_ACTION` 45, `FRONT_MAX` 49, enveloppe de `frame` 116-117, `disposer` 140-146, `_contexte` 224-238, `_maj` 273-275,
`_regard` 415-423. `js/manette.js` : contexte 193-198, garde 206, `camera` 334-340 (bornes 338), `vibrer` 376.
`js/manette_menus.js` : `RACINES` 16, `RETOUR` 18, `DEFAUTS` 20, `retour` 340-344. `js/ui.js` : bloc manette 45-57,
Commandes 165-175, `listen` 234, `HUD` 269-312, `showOverlay` 361. `js/fx.js` : `BUDGET_IMAGE` 454, passes 616-644
(`oeil` 618), `flash` 647/2017, `calme` 1813, `_enJeu` 1911-1916, rendu 2062. `js/collisions.js` : `CASE` 57, corps
59, `_parcourir` 191, `resoudre` 213, `deplacer` 235, `libre` 278, `rayonLibre` 288, `_segment` 300.
`js/carte_ecole.js` : jour 628, `maj` 2420-2452 (portes 2446), retour 2465-2475. `js/ecole_portes.js` : `RAYON_AUTO`
297, `DUREE` 298, `_formePorte` 561, `maj` 580-609. `js/ecole_visibilite.js` : `zoneDe` 115, `exclu` 159-165,
`fermeesVues` 329-335, `zonesCachees` 336, `poserVisibilite` 389 (FERMEES 392-398). `js/ecole_ascenseur.js` :
`transporter` 442, `majAscenseur` 456. `js/ecole_etage1.js` : sièges 1044-1053 (`tous` 1046). `js/kit_decor.js` :
piège du chargeur 441-452. `js/chargement.js` : astuces 465-476, « APPUIE » 543, départ automatique 577.
`index.html` : CSS 23, sous-titre 128, `#hud` 207-216, importmap 272-277. `sw.js` : `VERSION` 8, lourds 23.
`tools/liste_chargement.py` : `graphe_modules` 74.
LA CAGE (`C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1`, 0d55a0c) : `js/net.js` (`Rng` 224, `Horloge` 252,
`heurePas` 299, `Tampon` 319), `serveur/relais.js`, `serveur/node.mjs`, `js/enligne.js` (`EntreeDistante` 80, image
318-349), `js/ai.js` (`moveTo` 88, `sprintH` 103, règle du cap 38-44), `js/game.js` (pilotes 1153-1158, contacts
2170-2193, compte à rebours 1159-1164), `js/fit.js:403-437` (`appliquerFit`), `js/portraits.js:106`,
`js/presence.js:71-76` (`AVATARS_PLEINS`), `js/audio.js` (`buzzer` 178, `refus` 180, `whistle` 234),
`js/roster.js:6-163`, `index.html:319-365` (crédits), `hoopfx.js:10-13` (ressort).
Banc jetable des lecteurs : `scratchpad/jeu/banc/{armer,accroupi,ragdoll,touches,bras_fps}.js` (à recopier).
